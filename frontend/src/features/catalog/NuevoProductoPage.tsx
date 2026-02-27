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
    X
} from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import type { FilaVariante } from "./types";
import styles from "./NuevoProductoPage.module.css";

// UUID placeholder para CategoriaId mientras no existe el endpoint de categorías
const CATEGORIA_PLACEHOLDER = "00000000-0000-0000-0000-000000000001";

// Temporadas disponibles
const TEMPORADAS = ["Primavera-Verano 2025", "Otoño-Invierno 2025", "Primavera-Verano 2026", "Otoño-Invierno 2026", "Todo el año"];

/**
 * Formulario de carga matricial de productos.
 * El usuario ingresa talles y colores como chips; el sistema genera automáticamente
 * la tabla de variantes (N talles × M colores) con campos editables de SKU, costo y precio especial.
 */
export function NuevoProductoPage() {
    const navigate = useNavigate();

    // ──────────────────────────────────────────────────────── Datos base del producto
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precioBase, setPrecioBase] = useState("");
    const [temporada, setTemporada] = useState(TEMPORADAS[2]);

    // ──────────────────────────────────────────────────────── Chips de talles y colores
    const [talles, setTalles] = useState<string[]>([]);
    const [colores, setColores] = useState<string[]>([]);
    const [inputTalle, setInputTalle] = useState("");
    const [inputColor, setInputColor] = useState("");

    // ──────────────────────────────────────────────────────── Tabla de variantes
    const [filas, setFilas] = useState<FilaVariante[]>([]);

    // ──────────────────────────────────────────────────────── Estado UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ── Generación reactiva de la tabla de variantes ─────────────────────────
    useEffect(() => {
        if (talles.length === 0 || colores.length === 0) {
            setFilas([]);
            return;
        }

        // Generamos el producto cartesiano (cada combinación talle × color)
        const nuevasFilas: FilaVariante[] = [];
        for (const talle of talles) {
            for (const color of colores) {
                // Conservar los valores editados del usuario si la fila ya existía
                const existente = filas.find(f => f.talle === talle && f.color === color);
                nuevasFilas.push(existente ?? { talle, color, sku: "", precioCosto: "", precioOverride: "" });
            }
        }
        setFilas(nuevasFilas);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [talles, colores]);

    // ── Helpers para chips ────────────────────────────────────────────────────
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

    // ── Editar una celda de la tabla ──────────────────────────────────────────
    const editarFila = (idx: number, campo: keyof FilaVariante, valor: string) => {
        setFilas(prev => prev.map((f, i) => i === idx ? { ...f, [campo]: valor } : f));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validaciones básicas
        if (!nombre.trim()) return setError("El nombre del producto es obligatorio.");
        if (!precioBase || Number(precioBase) <= 0) return setError("El precio base debe ser mayor a $0.");
        if (filas.length === 0) return setError("Agregá al menos un talle y un color para generar las variantes.");

        setLoading(true);
        try {
            const resp = await catalogApi.crearProductoConVariantes({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precioBase: Number(precioBase),
                categoriaId: CATEGORIA_PLACEHOLDER,
                temporada,
                variantes: filas.map(f => ({
                    talle: f.talle,
                    color: f.color,
                    sku: f.sku.trim(),
                    precioCosto: f.precioCosto ? Number(f.precioCosto) : 0,
                    precioOverride: f.precioOverride ? Number(f.precioOverride) : undefined,
                })),
            });

            setSuccess(`¡Producto creado! ID: ${resp.id} — ${filas.length} variantes guardadas.`);
            // Reset del formulario
            setNombre(""); setDescripcion(""); setPrecioBase(""); setTemporada(TEMPORADAS[2]);
            setTalles([]); setColores([]); setFilas([]);
        } catch (err: unknown) {
            const mensaje =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { mensaje?: string, detalles?: { Error: string }[] } } })
                        .response?.data?.mensaje
                    : null;
            setError(mensaje || "No se pudo crear el producto. Revisá la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* ── Header ───────────────────────────────────────────────────────── */}
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Nuevo Producto</h1>
                        <p className={styles.subtitle}>
                            Completá los datos base y generá la matriz de variantes (talle/color) en segundos.
                        </p>
                    </div>
                    <Link to="/catalogo" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Volver al catálogo
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ── Datos base del producto ─────────────────────────────────────── */}
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

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Temporada</label>
                                <select
                                    className={styles.input}
                                    value={temporada}
                                    onChange={e => setTemporada(e.target.value)}
                                    disabled={loading}
                                >
                                    {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Generador de variantes ──────────────────────────────────────── */}
                    <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                        <h2 className={styles.cardTitle}>
                            <Palette size={20} weight="bold" />
                            Generador de Variantes (Talle × Color)
                        </h2>

                        <div className={styles.grid2}>

                            {/* Chips de talles */}
                            <div className={styles.chipsSection}>
                                <label className={styles.label}>
                                    Talles <span className={styles.required}>*</span>
                                </label>
                                <div
                                    className={styles.chipsWrap}
                                    onClick={() => document.getElementById("inputTalle")?.focus()}
                                >
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
                                <span className={styles.chipHint}>Escribí un talle y presioná Enter</span>
                            </div>

                            {/* Chips de colores */}
                            <div className={styles.chipsSection}>
                                <label className={styles.label}>
                                    Colores <span className={styles.required}>*</span>
                                </label>
                                <div
                                    className={styles.chipsWrap}
                                    onClick={() => document.getElementById("inputColor")?.focus()}
                                >
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

                    {/* ── Tabla de variantes generadas ───────────────────────────────── */}
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
                                    Agregá talles y colores arriba para generar automáticamente la tabla de variantes.
                                </p>
                            </div>
                        ) : (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Talle</th>
                                            <th>Color</th>
                                            <th>SKU (opcional)</th>
                                            <th>Costo unitario</th>
                                            <th>Precio especial</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filas.map((fila, idx) => (
                                            <tr key={`${fila.talle}-${fila.color}`}>
                                                <td><span className={styles.talleChip}>{fila.talle}</span></td>
                                                <td><span className={styles.colorChip}>{fila.color}</span></td>
                                                <td>
                                                    <input
                                                        className={styles.tableInput}
                                                        type="text"
                                                        placeholder="Auto-generado"
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Mensajes de feedback ─────────────────────────────────────────── */}
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
                            className={styles.input}
                            style={{
                                background: "transparent",
                                border: "1px solid var(--color-gray-600)",
                                color: "var(--color-gray-300)",
                                cursor: loading ? "not-allowed" : "pointer",
                                padding: "10px 24px",
                                width: "auto",
                                borderRadius: "var(--radius-md)",
                                fontWeight: 500,
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
