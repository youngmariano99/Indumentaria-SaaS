import { useState, useEffect, type KeyboardEvent, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    PlusCircle,
    CheckCircle,
    WarningCircle,
    X,
    Tag,
    Trash,
    Plus,
} from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import { categoriasApi } from "./api/categoriasApi";
import type { CategoriaDto } from "./api/categoriasApi";
import { ajustesApi } from "../ajustes/api/ajustesApi";
import type { FilaVariante } from "./types";
import { TALLES_POR_TIPO, TIPOS_PRODUCTO } from "./data/tallesPorTipo";
import styles from "./NuevoProductoPage.module.css";
import { useRubroStore } from "../../store/rubroStore";
import { FieldFactory, Drawer } from "../../components/common";
import type { FieldDefinition } from "../../components/common";
import { ComponentRegistry } from "../../core/registry/ComponentRegistry";
import { useRubro } from "../../hooks/useRubro";



import { useParams } from "react-router-dom";

export function NuevoProductoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    // Resolución dinámica de componente vertical
    const VariantesGridDynamic = ComponentRegistry.VariantesGrid.indumentaria;

    // ── Datos base del producto ────────────────────────────────────────────────
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precioBase, setPrecioBase] = useState("");
    const [temporada, setTemporada] = useState("");
    const [tipoProducto, setTipoProducto] = useState<string>(TIPOS_PRODUCTO[0]);

    // Categorías dinámicas
    const [categoriasRaw, setCategoriasRaw] = useState<CategoriaDto[]>([]);
    const [categoriaId, setCategoriaId] = useState("");

    const { getSmartDefaults } = useRubro();
    const esquemaMetadatos = useRubroStore(state => state.esquema as FieldDefinition[]);
    const [metadataValues, setMetadataValues] = useState<Record<string, any>>({});

    const handleMetadataChange = (key: string, value: any) => {
        setMetadataValues(prev => ({ ...prev, [key]: value }));
    };

    // Esquema dinámico del servidor
    const [formSchema, setFormSchema] = useState<any>(null);
    const [ean13, setEan13] = useState("");

    // Aplicar Smart Defaults al inicio si no es edición
    useEffect(() => {
        if (!isEditMode) {
            const defaults = getSmartDefaults();
            if (defaults.tipoProducto) setTipoProducto(defaults.tipoProducto);
            if (defaults.temporada) setTemporada(defaults.temporada);
            if (defaults.metadata) {
                setMetadataValues(prev => ({ ...prev, ...defaults.metadata }));
            }
        }
    }, [isEditMode, getSmartDefaults]);

    // ── Chips de talles y colores ──────────────────────────────────────────────
    const [talles, setTalles] = useState<string[]>([]);
    const [colores, setColores] = useState<string[]>([]);
    const [inputTalle, setInputTalle] = useState("");
    const [inputColor, setInputColor] = useState("");

    // ── Tabla de variantes ─────────────────────────────────────────────────────
    const [filas, setFilas] = useState<FilaVariante[]>([]);
    const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());

    // ── Edición masiva (bulk-edit) ───────────────────────────────────────
    const [bulkPrecio, setBulkPrecio] = useState("");
    const [bulkCosto, setBulkCosto] = useState("");
    const [bulkStock, setBulkStock] = useState("");
    const [bulkSku, setBulkSku] = useState("");

    // ── Atributos adicionales (pares clave/valor comunes a todas las variantes) ─
    const [atributos, setAtributos] = useState<Array<{ clave: string; valor: string }>>([]);
    const [inputAtributoClave, setInputAtributoClave] = useState("");
    const [inputAtributoValor, setInputAtributoValor] = useState("");

    // ── Atributos específicos por variante (Modal) ──
    const [modalFilaIdx, setModalFilaIdx] = useState<number | null>(null);
    const [bulkAtributoClave, setBulkAtributoClave] = useState("");
    const [bulkAtributoValor, setBulkAtributoValor] = useState("");

    // ── Nueva Categoría (Drawer) ──
    const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    // ── Estado UI ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ── Talles y atributos configurados por el tenant ─────────────────────────
    const [tallesConfig, setTallesConfig] = useState<Record<string, string[]>>(TALLES_POR_TIPO);

    // Cargar config del tenant al montar
    useEffect(() => {
        // Categorías
        categoriasApi.obtenerCategorias().then(data => setCategoriasRaw(data)).catch(() => { });

        // Talles personalizados
        ajustesApi.obtenerTalles().then(data => {
            if (data.tallesPorTipo && Object.keys(data.tallesPorTipo).length > 0) {
                setTallesConfig(prev => ({ ...prev, ...data.tallesPorTipo }));
            }
        }).catch(() => { });

        // Atributos predefinidos para el tipo inicial
        ajustesApi.obtenerAtributos().then(data => {
            const tipo = TIPOS_PRODUCTO[0];
            const defaults = data.atributosPorTipo?.[tipo] ?? [];
            if (defaults.length > 0) setAtributos(defaults);
        }).catch(() => { });

        // Cargar esquema de metadatos del servidor
        catalogApi.obtenerFormSchema().then(schema => {
            setFormSchema(schema);
        }).catch(() => { });
    }, []);

    // ── Pre-carga talles al cambiar tipo de producto ───────────────────────────
    const handleTipoChange = (nuevo: string) => {
        setTipoProducto(nuevo);
        const tallesToAdd = tallesConfig[nuevo] ?? TALLES_POR_TIPO[nuevo] ?? [];
        setTalles(tallesToAdd);
        // Cargar atributos predefinidos del tipo nuevo
        ajustesApi.obtenerAtributos().then(data => {
            const defaults = data.atributosPorTipo?.[nuevo] ?? [];
            setAtributos(defaults);
        }).catch(() => { });
    };

    // ── Pre-carga inicial Modo Edición ──────────────────────────────────────────
    useEffect(() => {
        if (!isEditMode) return;
        setLoading(true);
        catalogApi.obtenerProductoPorId(id!).then(prod => {
            setNombre(prod.nombre);
            setDescripcion(prod.descripcion || "");
            setPrecioBase(prod.precioBase.toString());
            setTemporada(prod.temporada || "");
            setTipoProducto(prod.tipoProducto);
            setCategoriaId(prod.categoriaId);
            if (prod.ean13) setEan13(prod.ean13);

            // Metadatos dinámicos
            try {
                const prodMetadatos = JSON.parse(prod.metadatosJson || "{}");
                setMetadataValues(prodMetadatos);
            } catch {
                // Si no hay metadatos o el JSON es inválido, mantenemos el objeto vacío
                setMetadataValues({});
            }

            // Poblar chips usando Sets
            const tallesUnicos = new Set<string>();
            const coloresUnicos = new Set<string>();
            prod.variantes.forEach(v => {
                tallesUnicos.add(v.talle);
                coloresUnicos.add(v.color);
            });
            setTalles(Array.from(tallesUnicos));
            setColores(Array.from(coloresUnicos));

            // Poblar las filas con los IDs de DB preexistentes y sus atributos
            const mapper: FilaVariante[] = prod.variantes.map(v => {
                let specificAttrs: Record<string, string> = {};
                try {
                    specificAttrs = JSON.parse(v.atributosJson || "{}");
                } catch { }

                return {
                    id: v.id,
                    talle: v.talle,
                    color: v.color,
                    sku: v.sku || "",
                    precioCosto: String(v.precioCosto || 0),
                    precioOverride: v.precioOverride ? String(v.precioOverride) : "",
                    stockInicial: String(v.stockActual || 0),
                    atributos: specificAttrs
                };
            });
            setFilas(mapper);

            // Cargar atributos globales del primer item solo como base visual si corresponde
            if (prod.variantes.length > 0) {
                try {
                    const firstAttrs = JSON.parse(prod.variantes[0].atributosJson || "{}");
                    const kvArr = Object.entries(firstAttrs).map(([k, v]) => ({ clave: k, valor: String(v) }));
                    setAtributos(kvArr);
                } catch { }
            }
        }).catch(() => {
            setError("No se pudo cargar el producto para editar.");
        }).finally(() => setLoading(false));
    }, [isEditMode, id]);

    // ── Generación reactiva de la tabla de variantes ───────────────────────────
    useEffect(() => {
        if (talles.length === 0 || colores.length === 0) {
            setFilas([]);
            return;
        }
        const nuevasFilas: FilaVariante[] = [];
        for (const talle of talles) {
            for (const color of colores) {
                const existente = filas.find(f => f.talle === talle && f.color === color);
                nuevasFilas.push(
                    existente ?? { talle, color, sku: "", precioCosto: "", precioOverride: "", stockInicial: "0", atributos: {} }
                );
            }
        }
        setFilas(nuevasFilas);
        setSeleccionadas(new Set()); // limpiar selección al regenerar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [talles, colores, isEditMode]);

    // ── Helpers chips ──────────────────────────────────────────────────────────
    const agregarTalle = () => {
        const v = inputTalle.trim().toUpperCase();
        if (v && !talles.includes(v)) setTalles(prev => [...prev, v]);
        setInputTalle("");
    };

    const agregarColor = () => {
        const v = inputColor.trim();
        const cap = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        if (cap && !colores.includes(cap)) setColores(prev => [...prev, cap]);
        setInputColor("");
    };

    const onKeyTalle = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregarTalle(); }
        if (e.key === "Backspace" && inputTalle === "" && talles.length > 0)
            setTalles(prev => prev.slice(0, -1));
    };

    const onKeyColor = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregarColor(); }
        if (e.key === "Backspace" && inputColor === "" && colores.length > 0)
            setColores(prev => prev.slice(0, -1));
    };

    const editarFila = (idx: number, campo: keyof FilaVariante, valor: string) => {
        setFilas(prev => prev.map((f, i) => i === idx ? { ...f, [campo]: valor } : f));
    };

    // ── Eliminar fila individual de la tabla ────────────────────────────────────
    const eliminarFila = (idx: number) => {
        setFilas(prev => prev.filter((_, i) => i !== idx));
        setSeleccionadas(prev => {
            const next = new Set(prev);
            next.delete(idx);
            // Re-indexar: los índices mayores a idx se reducen en 1
            return new Set([...next].map(i => i > idx ? i - 1 : i));
        });
    };

    // ── Selección de filas ─────────────────────────────────────────────────
    const toggleFila = (idx: number) => {
        setSeleccionadas(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const toggleTodas = () => {
        if (seleccionadas.size === filas.length) {
            setSeleccionadas(new Set());
        } else {
            setSeleccionadas(new Set(filas.map((_, i) => i)));
        }
    };

    // ── Aplicar valores masivos a las filas seleccionadas ──────────────────────
    const aplicarASeleccionadas = () => {
        // Primero ordenamos los índices seleccionados para iterar en el mismo orden visual de la tabla
        const seleccionadasArray = Array.from(seleccionadas).sort((a, b) => a - b);

        setFilas(prev => {
            const nextFilas = [...prev];

            let skuCounter = 0;
            let baseSkuPrefix = "";
            let baseSkuPadding = 0;
            let isAutoIncrementSku = false;

            // Detectar si el SKU masivo introducido termina en un número escalable (ej: REM-01, ART-005)
            if (bulkSku.trim()) {
                const match = bulkSku.trim().match(/^(.*?)(\d+)$/);
                if (match) {
                    isAutoIncrementSku = true;
                    baseSkuPrefix = match[1];
                    baseSkuPadding = match[2].length;
                    skuCounter = parseInt(match[2], 10);
                }
            }

            // Solo iterar por las filas seleccionadas, en orden
            for (let j = 0; j < seleccionadasArray.length; j++) {
                const i = seleccionadasArray[j];
                const f = nextFilas[i];
                let nextSku = f.sku;

                if (bulkSku.trim()) {
                    if (isAutoIncrementSku) {
                        nextSku = `${baseSkuPrefix}${skuCounter.toString().padStart(baseSkuPadding, '0')}`;
                        skuCounter++;
                    } else {
                        nextSku = bulkSku.trim();
                    }
                }

                nextFilas[i] = {
                    ...f,
                    ...(bulkPrecio !== "" ? { precioOverride: bulkPrecio } : {}),
                    ...(bulkCosto !== "" ? { precioCosto: bulkCosto } : {}),
                    ...(bulkStock !== "" ? { stockInicial: bulkStock } : {}),
                    ...(bulkSku.trim() !== "" ? { sku: nextSku } : {}),
                };
            }
            return nextFilas;
        });
        setBulkPrecio("");
        setBulkCosto("");
        setBulkStock("");
        setBulkSku("");
        setBulkAtributoClave("");
        setBulkAtributoValor("");
    };

    // ── Aplicar atributos masivos ──────────────────────────────────────────
    const aplicarAtributoMasivo = () => {
        const c = bulkAtributoClave.trim();
        const v = bulkAtributoValor.trim();
        if (!c) return;

        const seleccionadasArray = Array.from(seleccionadas);
        setFilas(prev => {
            const next = [...prev];
            for (const i of seleccionadasArray) {
                const attrs = { ...(next[i].atributos || {}) };
                attrs[c] = v;
                next[i] = { ...next[i], atributos: attrs };
            }
            return next;
        });
        setBulkAtributoClave("");
        setBulkAtributoValor("");
    };

    const quitarAtributoEspecifico = (filaIdx: number, clave: string) => {
        setFilas(prev => prev.map((f, i) => {
            if (i !== filaIdx) return f;
            const nextAttrs = { ...(f.atributos || {}) };
            delete nextAttrs[clave];
            return { ...f, atributos: nextAttrs };
        }));
    };

    const agregarAtributoEspecifico = (filaIdx: number, clave: string, valor: string) => {
        if (!clave.trim()) return;
        setFilas(prev => prev.map((f, i) => {
            if (i !== filaIdx) return f;
            return { ...f, atributos: { ...(f.atributos || {}), [clave.trim()]: valor.trim() } };
        }));
    };

    // ── Atributos adicionales ──────────────────────────────────────────────────
    const agregarAtributo = () => {
        const c = inputAtributoClave.trim();
        const v = inputAtributoValor.trim();
        if (!c) return;
        if (atributos.some(a => a.clave === c)) return; // no duplicar clave
        setAtributos(prev => [...prev, { clave: c, valor: v }]);
        setInputAtributoClave("");
        setInputAtributoValor("");
    };

    const editarAtributo = (idx: number, campo: "clave" | "valor", valor: string) => {
        setAtributos(prev => prev.map((a, i) => i === idx ? { ...a, [campo]: valor } : a));
    };

    const quitarAtributo = (idx: number) => {
        setAtributos(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!nombre.trim()) return setError("El nombre del producto es obligatorio.");
        if (!categoriaId) return setError("Debe seleccionar una categoría.");
        if (!precioBase || Number(precioBase) <= 0) return setError("El precio base debe ser mayor a $0.");
        if (filas.length === 0) return setError("Agregá al menos un talle y un color para generar las variantes.");

        setLoading(true);
        try {
            // Convertir atributos a Record<string,string> para el backend
            const atributosMap: Record<string, string> = {};
            atributos.forEach(a => { if (a.clave.trim()) atributosMap[a.clave.trim()] = a.valor.trim(); });

            if (isEditMode) {
                // MODO EDICIÓN
                await catalogApi.editarProducto(id!, {
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim(),
                    precioBase: Number(precioBase),
                    categoriaId: categoriaId,
                    temporada,
                    tipoProducto,
                    metadatosJson: JSON.stringify(metadataValues),
                    variantes: filas.map(f => ({
                        id: f.id, 
                        precioCosto: f.precioCosto ? Number(f.precioCosto) : 0,
                        precioOverride: f.precioOverride ? Number(f.precioOverride) : undefined,
                        stockInicial: f.stockInicial ? Number(f.stockInicial) : 0,
                        atributos: atributosMap,
                    })).filter(f => f.id)
                });
                setSuccess(`Producto actulizado exitosamente.`);
                setTimeout(() => navigate("/catalogo"), 1500);
            } else {
                // MODO CREACIÓN
                const resp = await catalogApi.crearProductoConVariantes({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim(),
                    precioBase: Number(precioBase),
                    categoriaId: categoriaId,
                    temporada,
                    tipoProducto,
                    ean13,
                    metadatosJson: JSON.stringify(metadataValues),
                    variantes: filas.map(f => {
                        const finalAttrs = { ...atributosMap, ...(f.atributos || {}) };
                        return {
                            talle: f.talle,
                            color: f.color,
                            sku: f.sku.trim(),
                            precioCosto: f.precioCosto ? Number(f.precioCosto) : 0,
                            precioOverride: f.precioOverride ? Number(f.precioOverride) : undefined,
                            stockInicial: f.stockInicial ? Number(f.stockInicial) : 0,
                            atributos: finalAttrs,
                        };
                    }),
                });
                setSuccess(`¡Producto creado! ID: ${resp.id} — ${filas.length} variantes guardadas.`);
                setNombre(""); setDescripcion(""); setPrecioBase(""); setTemporada("");
                setMetadataValues({});
                setTalles([]); setColores([]); setFilas([]); setAtributos([]);
            }
        } catch (err: unknown) {
            const mensaje =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje
                    : null;
            setError(mensaje || "No se pudo crear el producto. Revisá la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>{isEditMode ? "Editar Producto" : "Nuevo Producto"}</h1>
                        <p className={styles.subtitle}>
                            {isEditMode ? "Actualizá precios y atributos del producto y sus variantes." : "Completá los datos base y generá la matriz de variantes en segundos."}
                        </p>
                    </div>
                    <Link to="/catalogo" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Volver al catálogo
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ── Datos del producto ───────────────────────────────────────────── */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <Package size={20} weight="bold" />
                            Datos del Producto
                        </h2>

                        {/* Formulario dinámico cargado del Backend */}
                        {formSchema ? (
                            <div className={styles.grid2}>
                                {formSchema.fields.map((campo: any) => {
                                    // Custom render para categoría porque tiene árbol anidado y botón flotante
                                    if (campo.name === "categoriaId") {
                                        return (
                                            <div key={campo.name} className={`${styles.fieldGroup} ${campo.gridSpan === 2 ? styles.fullSpan : ''}`}>
                                                <label className={styles.label}>
                                                    <Tag size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                                    {campo.label} {campo.required && <span className={styles.required}>*</span>}
                                                </label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <select
                                                        className={styles.input}
                                                        value={categoriaId}
                                                        onChange={e => setCategoriaId(e.target.value)}
                                                        disabled={loading || categoriasRaw.length === 0}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <option value="">Seleccione una categoría...</option>
                                                        {(function aplanar(cats: CategoriaDto[], prefix = ""): React.ReactNode[] {
                                                            let opts: React.ReactNode[] = [];
                                                            for (const c of cats) {
                                                                opts.push(<option key={c.id} value={c.id}>{prefix}{c.nombre}</option>);
                                                                if (c.subcategorias?.length > 0) {
                                                                    opts = opts.concat(aplanar(c.subcategorias, prefix + "— "));
                                                                }
                                                            }
                                                            return opts;
                                                        })(categoriasRaw)}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className={styles.addAtributoBtn}
                                                        onClick={() => setShowCategoryDrawer(true)}
                                                        title="Nueva Categoría"
                                                        disabled={loading}
                                                    >
                                                        <Plus size={18} weight="bold" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Renderizado base de FieldFactory
                                    return (
                                        <FieldFactory
                                            key={campo.name}
                                            definition={{
                                                id: campo.name,
                                                label: campo.label,
                                                type: campo.type,
                                                required: campo.required,
                                                fullWidth: campo.gridSpan === 2,
                                                options: campo.options ? campo.options.map((o: string) => ({ label: o || "Ninguno", value: o })) : undefined,
                                            }}
                                            value={
                                                campo.name === 'nombre' ? nombre :
                                                campo.name === 'descripcion' ? descripcion :
                                                campo.name === 'precioBase' ? precioBase :
                                                campo.name === 'ean13' ? ean13 :
                                                campo.name === 'temporada' ? temporada :
                                                campo.name === 'tipoProducto' ? tipoProducto :
                                                metadataValues[campo.name]
                                            }
                                            onChange={val => {
                                                if (campo.name === 'nombre') setNombre(val);
                                                else if (campo.name === 'descripcion') setDescripcion(val);
                                                else if (campo.name === 'precioBase') setPrecioBase(val);
                                                else if (campo.name === 'ean13') setEan13(val);
                                                else if (campo.name === 'temporada') setTemporada(val);
                                                else if (campo.name === 'tipoProducto') handleTipoChange(val);
                                                else handleMetadataChange(campo.name, val);
                                            }}
                                            disabled={loading}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: "3rem", textAlign: "center", color: "#666" }}>Cargando campos del producto...</div>
                        )}
                    </div>

                    {/* ── Metadatos Dinámicos (UI Mutante) ─────────────────────────────────── */}
                    {esquemaMetadatos.length > 0 && (
                        <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                            <h2 className={styles.cardTitle}>
                                <Tag size={20} weight="bold" />
                                Especificaciones del {useRubroStore.getState().translate('Producto', 'Producto')}
                            </h2>

                            <div className={styles.grid2}>
                                {esquemaMetadatos.map(campo => (
                                    <FieldFactory
                                        key={campo.id}
                                        definition={campo}
                                        value={metadataValues[campo.id]}
                                        onChange={(val) => handleMetadataChange(campo.id, val)}
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Generador de variantes Dinámico (Feature-Sliced Design) ── */}
                    <Suspense fallback={<div className={styles.card} style={{ marginTop: "var(--space-6)", textAlign: "center", padding: "2rem" }}>Cargando grilla del rubro...</div>}>
                        <VariantesGridDynamic
                            talles={talles} colores={colores} inputTalle={inputTalle} inputColor={inputColor}
                            loading={loading} filas={filas} seleccionadas={seleccionadas}
                            bulkPrecio={bulkPrecio} bulkCosto={bulkCosto} bulkStock={bulkStock}
                            bulkAtributoClave={bulkAtributoClave} bulkAtributoValor={bulkAtributoValor}
                            
                            setTalles={setTalles} setColores={setColores} setInputTalle={setInputTalle} setInputColor={setInputColor}
                            agregarTalle={agregarTalle} agregarColor={agregarColor}
                            onKeyTalle={onKeyTalle} onKeyColor={onKeyColor}
                            setSeleccionadas={setSeleccionadas} toggleTodas={toggleTodas} toggleFila={toggleFila}
                            eliminarFila={eliminarFila} editarFila={editarFila} setModalFilaIdx={setModalFilaIdx}
                            setBulkPrecio={setBulkPrecio} setBulkCosto={setBulkCosto} setBulkStock={setBulkStock}
                            setBulkAtributoClave={setBulkAtributoClave} setBulkAtributoValor={setBulkAtributoValor}
                            aplicarASeleccionadas={aplicarASeleccionadas} aplicarAtributoMasivo={aplicarAtributoMasivo}
                        />
                    </Suspense>
                    {/* ────────────────────────────────────────────────────────────── */}

                    {/* ── Atributos adicionales ─────────────────────────────────────── */}
                    <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                        <h2 className={styles.cardTitle}>
                            <Tag size={20} weight="bold" />
                            Atributos adicionales
                            <span className={styles.chipHint} style={{ fontWeight: 400, marginLeft: 4 }}>(opcional — se aplican a todas las variantes)</span>
                        </h2>

                        {/* Tabla de atributos existentes */}
                        {atributos.length > 0 && (
                            <div className={styles.atributosGrid}>
                                {atributos.map((attr, idx) => (
                                    <div key={idx} className={styles.atributoRow}>
                                        <input
                                            className={styles.atributoInput}
                                            type="text"
                                            placeholder="Atributo (ej: Uso)"
                                            value={attr.clave}
                                            onChange={e => editarAtributo(idx, "clave", e.target.value)}
                                            disabled={loading}
                                        />
                                        <span className={styles.atributoSep}>:</span>
                                        <input
                                            className={styles.atributoInput}
                                            type="text"
                                            placeholder="Valor (ej: F11)"
                                            value={attr.valor}
                                            onChange={e => editarAtributo(idx, "valor", e.target.value)}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className={styles.deleteRowBtn}
                                            onClick={() => quitarAtributo(idx)}
                                            aria-label="Quitar atributo"
                                        >
                                            <X size={13} weight="bold" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Agregar nuevo atributo */}
                        <div className={styles.atributoRow} style={{ marginTop: atributos.length > 0 ? "var(--space-2)" : 0 }}>
                            <input
                                className={styles.atributoInput}
                                type="text"
                                placeholder="Nuevo atributo (ej: Material)"
                                value={inputAtributoClave}
                                onChange={e => setInputAtributoClave(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarAtributo(); } }}
                                disabled={loading}
                            />
                            <span className={styles.atributoSep}>:</span>
                            <input
                                className={styles.atributoInput}
                                type="text"
                                placeholder="Valor (ej: Cuero)"
                                value={inputAtributoValor}
                                onChange={e => setInputAtributoValor(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarAtributo(); } }}
                                disabled={loading}
                            />
                            <button type="button" className={styles.addAtributoBtn} onClick={agregarAtributo}>
                                <Plus size={14} weight="bold" /> Agregar
                            </button>
                        </div>
                        <span className={styles.chipHint} style={{ marginTop: "var(--space-2)", display: "block" }}>
                            Ej: Tipo de suelo: Sintético · Uso: F11 · Material: Cuero · Cierre: Cosido
                        </span>
                    </div>

                    {/* ── Feedback ─────────────────────────────────────────────────────── */}
                    {error && (
                        <div className={styles.errorAlert} style={{ marginTop: "var(--space-4)" }} role="alert">
                            <WarningCircle size={16} style={{ marginRight: "var(--space-2)", verticalAlign: "middle" }} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className={styles.successAlert} style={{ marginTop: "var(--space-4)" }} role="status">
                            <CheckCircle size={18} weight="bold" />
                            {success}
                        </div>
                    )}

                    {/* ── Acciones ─────────────────────────────────────────────────────── */}
                    <div className={styles.actions} style={{ marginTop: "var(--space-6)" }}>
                        <button
                            type="button"
                            style={{
                                background: "transparent",
                                border: "1px solid var(--color-gray-600)",
                                color: "var(--color-gray-300)",
                                cursor: loading ? "not-allowed" : "pointer",
                                padding: "10px 24px",
                                borderRadius: "var(--radius-md)",
                                fontWeight: 500,
                                fontFamily: "var(--font-ui)",
                                fontSize: "var(--text-base)",
                                transition: "all var(--transition-fast)",
                            }}
                            onClick={() => navigate("/catalogo")}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || filas.length === 0}
                            style={{
                                background: "var(--color-primary)",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                color: "white",
                                cursor: loading || filas.length === 0 ? "not-allowed" : "pointer",
                                fontFamily: "var(--font-ui)",
                                fontSize: "var(--text-base)",
                                fontWeight: 600,
                                opacity: loading || filas.length === 0 ? 0.6 : 1,
                                padding: "10px 28px",
                                transition: "all var(--transition-fast)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <PlusCircle size={20} weight="bold" />
                            {loading ? "Guardando…" : (isEditMode ? "Actualizar producto" : `Guardar producto ${filas.length > 0 ? `(${filas.length} variantes)` : ""}`)}
                        </button>
                    </div>

                </form>
            </div>
            {/* ── Drawer de Detalles de Variante (Sustituye al Modal antiguo) ── */}
            <Drawer
                isOpen={modalFilaIdx !== null}
                onClose={() => setModalFilaIdx(null)}
                title={modalFilaIdx !== null ? `Detalles: ${filas[modalFilaIdx].talle} / ${filas[modalFilaIdx].color}` : ""}
                footer={
                    <button
                        type="button"
                        onClick={() => setModalFilaIdx(null)}
                        style={{ 
                            width: '100%', 
                            padding: '0.6rem', 
                            backgroundColor: 'var(--color-primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontWeight: 600, 
                            cursor: 'pointer' 
                        }}
                    >
                        Listo
                    </button>
                }
            >
                {modalFilaIdx !== null && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            Agregá características únicas para esta variante. Estos valores sobreescriben los globales del producto.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {Object.entries(filas[modalFilaIdx].atributos || {}).map(([clave, valor]) => (
                                <div key={clave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', backgroundColor: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', minWidth: '80px' }}>{clave}:</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', flex: 1 }}>{valor}</span>
                                    <button
                                        type="button"
                                        onClick={() => quitarAtributoEspecifico(modalFilaIdx, clave)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: '4px' }}
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}
                            {Object.keys(filas[modalFilaIdx].atributos || {}).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', border: '2px dashed var(--color-border)', borderRadius: '12px' }}>
                                    No hay detalles específicos.
                                </div>
                            )}
                        </div>

                        <div className={styles.grid2} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', gap: '8px' }}>
                            <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                                <input
                                    id="modalAttrClave"
                                    className={styles.input}
                                    placeholder="Clave (ej: Estampa)"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            document.getElementById('modalAttrValor')?.focus();
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.fieldGroup} style={{ marginBottom: 0, display: 'flex', gap: '8px' }}>
                                <input
                                    id="modalAttrValor"
                                    className={styles.input}
                                    placeholder="Valor"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const c = (document.getElementById('modalAttrClave') as HTMLInputElement).value;
                                            const v = (document.getElementById('modalAttrValor') as HTMLInputElement).value;
                                            if (c && v) {
                                                agregarAtributoEspecifico(modalFilaIdx, c, v);
                                                (document.getElementById('modalAttrClave') as HTMLInputElement).value = "";
                                                (document.getElementById('modalAttrValor') as HTMLInputElement).value = "";
                                                document.getElementById('modalAttrClave')?.focus();
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.addAtributoBtn}
                                    onClick={() => {
                                        const c = (document.getElementById('modalAttrClave') as HTMLInputElement).value;
                                        const v = (document.getElementById('modalAttrValor') as HTMLInputElement).value;
                                        if (c && v) {
                                            agregarAtributoEspecifico(modalFilaIdx, c, v);
                                            (document.getElementById('modalAttrClave') as HTMLInputElement).value = "";
                                            (document.getElementById('modalAttrValor') as HTMLInputElement).value = "";
                                            document.getElementById('modalAttrClave')?.focus();
                                        }
                                    }}
                                >
                                    <Plus size={18} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* ── Drawer de Nueva Categoría ── */}
            <Drawer
                isOpen={showCategoryDrawer}
                onClose={() => setShowCategoryDrawer(false)}
                title="Nueva Categoría"
                footer={
                    <button
                        type="button"
                        onClick={async () => {
                            if (!newCatName.trim()) return;
                            setCreatingCategory(true);
                            try {
                                const id = await categoriasApi.crearCategoria({
                                    nombre: newCatName,
                                    descripcion: newCatDesc,
                                    codigoNcm: "",
                                    parentCategoryId: null
                                });
                                // Recargar categorías y seleccionar la nueva
                                const actualizadas = await categoriasApi.obtenerCategorias();
                                setCategoriasRaw(actualizadas);
                                setCategoriaId(id);
                                setShowCategoryDrawer(false);
                                setNewCatName("");
                                setNewCatDesc("");
                            } catch (e) {
                                console.error(e);
                            } finally {
                                setCreatingCategory(false);
                            }
                        }}
                        disabled={creatingCategory || !newCatName.trim()}
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: 'var(--color-primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 600, 
                            cursor: (creatingCategory || !newCatName.trim()) ? 'not-allowed' : 'pointer',
                            opacity: (creatingCategory || !newCatName.trim()) ? 0.6 : 1
                        }}
                    >
                        {creatingCategory ? "Creado..." : "Crear Categoría"}
                    </button>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nombre</label>
                        <input
                            className={styles.input}
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            placeholder="ej: Remeras, Pantalones..."
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Descripción (opcional)</label>
                        <textarea
                            className={styles.input}
                            value={newCatDesc}
                            onChange={e => setNewCatDesc(e.target.value)}
                            rows={3}
                            placeholder="Breve descripción de la categoría"
                        />
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
