import { useState, useEffect, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    Palette,
    Rows,
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
import { TALLES_POR_TIPO, NOMBRE_TIPO, TIPOS_PRODUCTO } from "./data/tallesPorTipo";
import styles from "./NuevoProductoPage.module.css";

const TEMPORADAS = [
    "",  // sin temporada
    "Primavera-Verano 2025",
    "Otoño-Invierno 2025",
    "Primavera-Verano 2026",
    "Otoño-Invierno 2026",
    "Todo el año",
];

import { useParams } from "react-router-dom";

export function NuevoProductoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // ── Datos base del producto ────────────────────────────────────────────────
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precioBase, setPrecioBase] = useState("");
    const [temporada, setTemporada] = useState("");
    const [tipoProducto, setTipoProducto] = useState<string>(TIPOS_PRODUCTO[0]);

    // Categorías dinámicas
    const [categoriasRaw, setCategoriasRaw] = useState<CategoriaDto[]>([]);
    const [categoriaId, setCategoriaId] = useState("");

    // ── Metadatos (Sprint 3.5) ─────────────────────────────────────────────────
    const [pesoKg, setPesoKg] = useState("");
    const [ean13, setEan13] = useState("");
    const [origen, setOrigen] = useState("");
    const [escalaTalles, setEscalaTalles] = useState("");

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

    // ── Atributos adicionales (pares clave/valor comunes a todas las variantes) ─
    const [atributos, setAtributos] = useState<Array<{ clave: string; valor: string }>>([]);
    const [inputAtributoClave, setInputAtributoClave] = useState("");
    const [inputAtributoValor, setInputAtributoValor] = useState("");

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

            // Metadatos
            setPesoKg(prod.pesoKg?.toString() || "");
            setEan13(prod.ean13 || "");
            setOrigen(prod.origen || "");
            setEscalaTalles(prod.escalaTalles || "");

            // Poblar chips usando Sets
            const tallesUnicos = new Set<string>();
            const coloresUnicos = new Set<string>();
            prod.variantes.forEach(v => {
                tallesUnicos.add(v.talle);
                coloresUnicos.add(v.color);
            });
            setTalles(Array.from(tallesUnicos));
            setColores(Array.from(coloresUnicos));

            // Poblar las filas con los IDs de DB preexistentes
            const mapper: FilaVariante[] = prod.variantes.map(v => {
                return {
                    id: v.id, // importante para mandar al PUT
                    talle: v.talle,
                    color: v.color,
                    sku: v.sku || "",
                    precioCosto: String(v.precioCosto || 0),
                    precioOverride: v.precioOverride ? String(v.precioOverride) : "",
                    stockInicial: String(v.stockActual || 0)
                };
            });
            setFilas(mapper);

            // Tratar de derivar atributos extra (solo lo hacemos del primer item si existen, simplificación)
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
                    existente ?? { talle, color, sku: "", precioCosto: "", precioOverride: "", stockInicial: "0" }
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
        setFilas(prev => prev.map((f, i) => {
            if (!seleccionadas.has(i)) return f;
            return {
                ...f,
                ...(bulkPrecio !== "" ? { precioOverride: bulkPrecio } : {}),
                ...(bulkCosto !== "" ? { precioCosto: bulkCosto } : {}),
                ...(bulkStock !== "" ? { stockInicial: bulkStock } : {}),
            };
        }));
        setBulkPrecio("");
        setBulkCosto("");
        setBulkStock("");
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
                    pesoKg: pesoKg ? Number(pesoKg) : 0,
                    ean13: ean13.trim(),
                    origen: origen.trim(),
                    escalaTalles: escalaTalles.trim(),
                    variantes: filas.map(f => ({
                        id: f.id, // Enviar si viene de DB
                        precioCosto: f.precioCosto ? Number(f.precioCosto) : 0,
                        precioOverride: f.precioOverride ? Number(f.precioOverride) : undefined,
                        atributos: atributosMap,
                    })).filter(f => f.id) // Solo enviamos las filas pre-existentes que tienen ID a EditarProductoCommand
                });
                setSuccess(`Producto actulizado exitosamente.`);
                setTimeout(() => navigate("/catalogo"), 1500); // Volver
            } else {
                // MODO CREACIÓN
                const resp = await catalogApi.crearProductoConVariantes({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim(),
                    precioBase: Number(precioBase),
                    categoriaId: categoriaId,
                    temporada,
                    tipoProducto,
                    pesoKg: pesoKg ? Number(pesoKg) : 0,
                    ean13: ean13.trim(),
                    origen: origen.trim(),
                    escalaTalles: escalaTalles.trim(),
                    variantes: filas.map(f => ({
                        talle: f.talle,
                        color: f.color,
                        sku: f.sku.trim(),
                        precioCosto: f.precioCosto ? Number(f.precioCosto) : 0,
                        precioOverride: f.precioOverride ? Number(f.precioOverride) : undefined,
                        stockInicial: f.stockInicial ? Number(f.stockInicial) : 0,
                        atributos: atributosMap,
                    })),
                });
                setSuccess(`¡Producto creado! ID: ${resp.id} — ${filas.length} variantes guardadas.`);
                setNombre(""); setDescripcion(""); setPrecioBase(""); setTemporada("");
                setPesoKg(""); setEan13(""); setOrigen(""); setEscalaTalles("");
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

                        <div className={styles.grid2}>
                            <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                                <label className={styles.label}>Nombre <span className={styles.required}>*</span></label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Ej: Jeans Duko Corte Mom"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                                <label className={styles.label}>Descripción</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Ej: Jean de corte recto, tela premium"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            {/* Categoría Seleccionable */}
                            <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                                <label className={styles.label}>
                                    <Tag size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                    Categoría <span className={styles.required}>*</span>
                                </label>
                                <select
                                    className={styles.input}
                                    value={categoriaId}
                                    onChange={e => setCategoriaId(e.target.value)}
                                    disabled={loading || categoriasRaw.length === 0}
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
                            </div>

                            {/* Tipo de producto — pre-carga los talles */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    <Tag size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                    Tipo de producto <span className={styles.required}>*</span>
                                </label>
                                <select
                                    className={styles.input}
                                    value={tipoProducto}
                                    onChange={e => handleTipoChange(e.target.value)}
                                    disabled={loading}
                                >
                                    {TIPOS_PRODUCTO.map(tipo => (
                                        <option key={tipo} value={tipo}>{NOMBRE_TIPO[tipo]}</option>
                                    ))}
                                </select>
                                <span className={styles.chipHint}>
                                    Al seleccionar el tipo, los talles se pre-cargan automáticamente
                                </span>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Temporada <span className={styles.chipHint}>(opcional)</span></label>
                                <select
                                    className={styles.input}
                                    value={temporada}
                                    onChange={e => setTemporada(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Sin temporada asignada</option>
                                    {TEMPORADAS.filter(t => t !== "").map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Precio de venta base <span className={styles.required}>*</span></label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="$25.000"
                                    value={precioBase}
                                    onChange={e => setPrecioBase(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Metadatos y Logística ───────────────────────────────────────────── */}
                    <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                        <h2 className={styles.cardTitle}>
                            <Tag size={20} weight="bold" />
                            Metadatos y Logística (Opcional)
                        </h2>

                        <div className={styles.grid2}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Peso (Kg)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Ej: 0.5"
                                    value={pesoKg}
                                    onChange={e => setPesoKg(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Código de barras base (EAN-13)</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Ej: 7791234567890"
                                    value={ean13}
                                    onChange={e => setEan13(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Origen</label>
                                <select
                                    className={styles.input}
                                    value={origen}
                                    onChange={e => setOrigen(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar origen...</option>
                                    <option value="Nacional">Nacional (Argentina)</option>
                                    <option value="Importado">Importado</option>
                                </select>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Escala de Talles</label>
                                <select
                                    className={styles.input}
                                    value={escalaTalles}
                                    onChange={e => setEscalaTalles(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar escala...</option>
                                    <option value="AR">Argentina (AR)</option>
                                    <option value="US">Estados Unidos (US)</option>
                                    <option value="EU">Europa (EU)</option>
                                    <option value="UK">Reino Unido (UK)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Generador de variantes ───────────────────────────────────────── */}
                    <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                        <h2 className={styles.cardTitle}>
                            <Palette size={20} weight="bold" />
                            Generador de Variantes (Talle × Color)
                        </h2>

                        <div className={styles.grid2}>
                            {/* Chips de talles */}
                            <div className={styles.chipsSection}>
                                <label className={styles.label}>Talles <span className={styles.required}>*</span></label>
                                <div className={styles.chipsWrap} onClick={() => document.getElementById("inputTalle")?.focus()}>
                                    {talles.map(t => (
                                        <span key={t} className={styles.chip}>
                                            {t}
                                            <button
                                                type="button"
                                                className={styles.chipRemove}
                                                onClick={() => setTalles(prev => prev.filter(x => x !== t))}
                                                aria-label={`Quitar talle ${t}`}
                                            >
                                                <X size={12} weight="bold" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        id="inputTalle"
                                        className={styles.chipInput}
                                        value={inputTalle}
                                        onChange={e => setInputTalle(e.target.value.toUpperCase())}
                                        onKeyDown={onKeyTalle}
                                        onBlur={agregarTalle}
                                        placeholder={talles.length === 0 ? "S, M, L, XL…" : ""}
                                        disabled={loading}
                                    />
                                </div>
                                <span className={styles.chipHint}>
                                    Pre-cargados según tipo · Podés editar libremente · Enter para agregar
                                </span>
                            </div>

                            {/* Chips de colores */}
                            <div className={styles.chipsSection}>
                                <label className={styles.label}>Colores <span className={styles.required}>*</span></label>
                                <div className={styles.chipsWrap} onClick={() => document.getElementById("inputColor")?.focus()}>
                                    {colores.map(c => (
                                        <span key={c} className={styles.chip} style={{ backgroundColor: "var(--color-success)" }}>
                                            {c}
                                            <button
                                                type="button"
                                                className={styles.chipRemove}
                                                onClick={() => setColores(prev => prev.filter(x => x !== c))}
                                                aria-label={`Quitar color ${c}`}
                                            >
                                                <X size={12} weight="bold" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        id="inputColor"
                                        className={styles.chipInput}
                                        value={inputColor}
                                        onChange={e => setInputColor(e.target.value)}
                                        onKeyDown={onKeyColor}
                                        onBlur={agregarColor}
                                        placeholder={colores.length === 0 ? "Negro, Azul, Blanco…" : ""}
                                        disabled={loading}
                                    />
                                </div>
                                <span className={styles.chipHint}>Escribí un color y presioná Enter</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabla de variantes generadas ────────────────────────────────── */}
                    <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                        <div className={styles.matrixHeader}>
                            <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                                <Rows size={20} weight="bold" />
                                Variantes Generadas
                            </h2>
                            {filas.length > 0 && (
                                <span className={styles.matrixCount}>
                                    {filas.length} variante{filas.length !== 1 ? "s" : ""}
                                    {seleccionadas.size > 0 && (
                                        <span style={{ marginLeft: 6, color: "var(--color-primary)", fontWeight: 700 }}>
                                            · {seleccionadas.size} seleccionada{seleccionadas.size !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>

                        {/* ── Barra de edición masiva ──────────────────────────────────── */}
                        {seleccionadas.size > 0 && (
                            <div className={styles.bulkBar}>
                                <span className={styles.bulkLabel}>
                                    Aplicar a {seleccionadas.size} fila{seleccionadas.size !== 1 ? "s" : ""}:
                                </span>
                                <div className={styles.bulkFields}>
                                    <div className={styles.bulkField}>
                                        <label className={styles.bulkFieldLabel}>Precio esp. $</label>
                                        <input
                                            className={styles.tableInput}
                                            type="number" min="0" step="0.01"
                                            placeholder="ej: 25000"
                                            value={bulkPrecio}
                                            onChange={e => setBulkPrecio(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.bulkField}>
                                        <label className={styles.bulkFieldLabel}>Costo $</label>
                                        <input
                                            className={styles.tableInput}
                                            type="number" min="0" step="0.01"
                                            placeholder="ej: 12000"
                                            value={bulkCosto}
                                            onChange={e => setBulkCosto(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.bulkField}>
                                        <label className={styles.bulkFieldLabel}>Stock inicial</label>
                                        <input
                                            className={styles.tableInput}
                                            type="number" min="0" step="1"
                                            placeholder="ej: 10"
                                            value={bulkStock}
                                            onChange={e => setBulkStock(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.bulkApplyBtn}
                                        onClick={aplicarASeleccionadas}
                                        disabled={bulkPrecio === "" && bulkCosto === "" && bulkStock === ""}
                                    >
                                        <CheckCircle size={15} weight="bold" />
                                        Aplicar
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.bulkCancelBtn}
                                        onClick={() => setSeleccionadas(new Set())}
                                    >
                                        Deseleccionar
                                    </button>
                                </div>
                            </div>
                        )}

                        {filas.length === 0 ? (
                            <div className={styles.emptyMatrix}>
                                <PlusCircle size={48} weight="thin" className={styles.emptyMatrixIcon} />
                                <p className={styles.emptyMatrixText}>
                                    Seleccioná el tipo de producto para pre-cargar los talles, luego agregá colores.
                                </p>
                            </div>
                        ) : (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 32, textAlign: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionadas.size === filas.length && filas.length > 0}
                                                    onChange={toggleTodas}
                                                    title="Seleccionar todas"
                                                    style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                                                />
                                            </th>
                                            <th style={{ width: 32 }}></th>
                                            <th>Talle</th>
                                            <th>Color</th>
                                            <th>SKU (opcional)</th>
                                            <th>Costo $</th>
                                            <th>Precio especial $</th>
                                            <th>Stock inicial</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filas.map((fila, idx) => (
                                            <tr
                                                key={`${fila.talle}-${fila.color}-${idx}`}
                                                className={`${styles.tableRow} ${seleccionadas.has(idx) ? styles.tableRowSelected : ""}`}
                                                onClick={() => toggleFila(idx)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={seleccionadas.has(idx)}
                                                        onChange={() => toggleFila(idx)}
                                                        style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                                                    />
                                                </td>
                                                <td onClick={e => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        className={styles.deleteRowBtn}
                                                        onClick={() => eliminarFila(idx)}
                                                        aria-label={`Eliminar variante ${fila.talle} ${fila.color}`}
                                                        title="Eliminar esta variante"
                                                    >
                                                        <Trash size={13} weight="bold" />
                                                    </button>
                                                </td>
                                                <td><span className={styles.talleChip}>{fila.talle}</span></td>
                                                <td><span className={styles.colorChip}>{fila.color}</span></td>
                                                <td>
                                                    <input
                                                        className={styles.tableInput}
                                                        type="text"
                                                        placeholder="Auto"
                                                        value={fila.sku}
                                                        onChange={e => editarFila(idx, "sku", e.target.value)}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className={styles.tableInput}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="$0"
                                                        value={fila.precioCosto}
                                                        onChange={e => editarFila(idx, "precioCosto", e.target.value)}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className={styles.tableInput}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Sin override"
                                                        value={fila.precioOverride}
                                                        onChange={e => editarFila(idx, "precioOverride", e.target.value)}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className={styles.tableInput}
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder="0"
                                                        value={fila.stockInicial}
                                                        onChange={e => editarFila(idx, "stockInicial", e.target.value)}
                                                        disabled={loading}
                                                        style={{ borderColor: Number(fila.stockInicial || 0) > 0 ? "var(--color-success)" : undefined }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

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
        </div>
    );
}
