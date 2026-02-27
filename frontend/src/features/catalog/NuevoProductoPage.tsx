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
import { ajustesApi } from "../ajustes/api/ajustesApi";
import type { FilaVariante } from "./types";
import { TALLES_POR_TIPO, NOMBRE_TIPO, TIPOS_PRODUCTO } from "./data/tallesPorTipo";
import styles from "./NuevoProductoPage.module.css";

// UUID placeholder para CategoriaId mientras no existe el endpoint de categorías
const CATEGORIA_PLACEHOLDER = "00000000-0000-0000-0000-000000000001";

const TEMPORADAS = [
    "",  // sin temporada
    "Primavera-Verano 2025",
    "Otoño-Invierno 2025",
    "Primavera-Verano 2026",
    "Otoño-Invierno 2026",
    "Todo el año",
];

export function NuevoProductoPage() {
    const navigate = useNavigate();

    // ── Datos base del producto ────────────────────────────────────────────────
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precioBase, setPrecioBase] = useState("");
    const [temporada, setTemporada] = useState("");
    const [tipoProducto, setTipoProducto] = useState<string>(TIPOS_PRODUCTO[0]);

    // ── Chips de talles y colores ──────────────────────────────────────────────
    const [talles, setTalles] = useState<string[]>([]);
    const [colores, setColores] = useState<string[]>([]);
    const [inputTalle, setInputTalle] = useState("");
    const [inputColor, setInputColor] = useState("");

    // ── Tabla de variantes ─────────────────────────────────────────────────────
    const [filas, setFilas] = useState<FilaVariante[]>([]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [talles, colores]);

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
        if (!precioBase || Number(precioBase) <= 0) return setError("El precio base debe ser mayor a $0.");
        if (filas.length === 0) return setError("Agregá al menos un talle y un color para generar las variantes.");

        setLoading(true);
        try {
            // Convertir atributos a Record<string,string> para el backend
            const atributosMap: Record<string, string> = {};
            atributos.forEach(a => { if (a.clave.trim()) atributosMap[a.clave.trim()] = a.valor.trim(); });

            const resp = await catalogApi.crearProductoConVariantes({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precioBase: Number(precioBase),
                categoriaId: CATEGORIA_PLACEHOLDER,
                temporada,
                tipoProducto,
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
            setTalles([]); setColores([]); setFilas([]); setAtributos([]);
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
                        <h1 className={styles.title}>Nuevo Producto</h1>
                        <p className={styles.subtitle}>
                            Completá los datos base y generá la matriz de variantes en segundos.
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
                                </span>
                            )}
                        </div>

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
                                            <tr key={`${fila.talle}-${fila.color}-${idx}`} className={styles.tableRow}>
                                                <td>
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
                            {loading ? "Guardando…" : `Guardar producto ${filas.length > 0 ? `(${filas.length} variantes)` : ""}`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
