import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    PlusCircle,
    WarningCircle,
    MagnifyingGlass,
    X,
    CaretDown,
    CaretUp,
    Funnel,
    Rows,
    PencilSimple,
    ArrowSquareOut,
    Trash,
} from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import type { ProductoConVariantes, VarianteResumen } from "./types";
import { NOMBRE_TIPO } from "./data/tallesPorTipo";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import styles from "./CatalogoPage.module.css";

const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// ──────────────────────────────────────────────────────────────────────────────
// Tipos del filtro
// ──────────────────────────────────────────────────────────────────────────────
interface Filtros {
    texto: string;       // busca en nombre, descripción, SKU
    temporada: string;
    tipo: string;
    talles: string[];    // varinte.talle debe incluir alguno
    colores: string[];
    precioMin: string;
    precioMax: string;
    atributo: string;    // busca en atributos JSON libremente
}

const FILTROS_VACIOS: Filtros = {
    texto: "", temporada: "", tipo: "",
    talles: [], colores: [],
    precioMin: "", precioMax: "",
    atributo: "",
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function atributosDeVariante(v: VarianteResumen): Record<string, string> {
    try {
        return v.atributosJson ? JSON.parse(v.atributosJson) : {};
    } catch { return {}; }
}

function productoMatchFiltros(p: ProductoConVariantes, f: Filtros): boolean {
    const textoLower = f.texto.toLowerCase();
    if (textoLower) {
        const enNombre = p.nombre.toLowerCase().includes(textoLower);
        const enDesc = p.descripcion?.toLowerCase().includes(textoLower);
        const enSku = p.variantes.some(v => v.sku?.toLowerCase().includes(textoLower));
        if (!enNombre && !enDesc && !enSku) return false;
    }
    if (f.temporada && p.temporada !== f.temporada) return false;
    if (f.tipo && p.tipoProducto !== f.tipo) return false;
    if (f.talles.length > 0 && !p.variantes.some(v => f.talles.includes(v.talle))) return false;
    if (f.colores.length > 0 && !p.variantes.some(v => f.colores.map(c => c.toLowerCase()).includes(v.color.toLowerCase()))) return false;
    if (f.precioMin && p.precioBase < Number(f.precioMin)) return false;
    if (f.precioMax && p.precioBase > Number(f.precioMax)) return false;
    if (f.atributo) {
        const aLower = f.atributo.toLowerCase();
        const hayMatch = p.variantes.some(v => {
            const attrs = atributosDeVariante(v);
            return Object.entries(attrs).some(([k, val]) =>
                k.toLowerCase().includes(aLower) || val.toLowerCase().includes(aLower)
            );
        });
        if (!hayMatch) return false;
    }
    return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────
export function CatalogoPage() {
    const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
    const [panelFiltros, setPanelFiltros] = useState(false);
    const [productoModal, setProductoModal] = useState<ProductoConVariantes | null>(null);
    const [inputTalle, setInputTalle] = useState("");
    const [inputColor, setInputColor] = useState("");

    const cargarCatalogo = async () => {
        setLoading(true); setError(null);
        try {
            const data = await catalogApi.obtenerCatalogo();
            setProductos(data);
        } catch {
            setError("No pudimos cargar el catálogo. Revisá la conexión.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCatalogo();
    }, []);

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Estás seguro de que querés ELIMINAR el producto "${nombre}"?\n(Esta acción lo ocultará de la grilla pero se conservará en el historial de ventas pasadas)`)) return;
        try {
            await catalogApi.eliminarProducto(id);
            alert("Producto eliminado correctamente.");
            setProductoModal(null);
            cargarCatalogo();
        } catch (e: any) {
            alert(e?.response?.data?.mensaje || "Error al eliminar el producto.");
        }
    };

    // ── Valores únicos para los filtros dropdown ──
    const opcionesTemporada = useMemo(() =>
        [...new Set(productos.map(p => p.temporada).filter(Boolean))], [productos]);
    const opcionesTipo = useMemo(() =>
        [...new Set(productos.map(p => p.tipoProducto).filter(Boolean))], [productos]);

    // ── Filtrado reactivo ──
    const productosFiltrados = useMemo(() =>
        productos.filter(p => productoMatchFiltros(p, filtros)),
        [productos, filtros]
    );

    const filtrosActivos = useMemo(() =>
        filtros.texto || filtros.temporada || filtros.tipo ||
        filtros.talles.length > 0 || filtros.colores.length > 0 ||
        filtros.precioMin || filtros.precioMax || filtros.atributo,
        [filtros]
    );

    const setFiltro = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
        setFiltros(prev => ({ ...prev, [key]: value }));

    const agregarTalleFiltro = () => {
        const v = inputTalle.trim().toUpperCase();
        if (v && !filtros.talles.includes(v)) setFiltro("talles", [...filtros.talles, v]);
        setInputTalle("");
    };
    const agregarColorFiltro = () => {
        const v = inputColor.trim();
        const cap = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        if (cap && !filtros.colores.includes(cap)) setFiltro("colores", [...filtros.colores, cap]);
        setInputColor("");
    };

    const totalVariantes = productosFiltrados.reduce((a, p) => a + p.variantes.length, 0);

    return (
        <>
            <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                        <h1>Catálogo de productos</h1>
                        <p>Gestioná los productos y su matriz de variantes.</p>
                    </div>
                    <div className={layoutStyles.topbarControls}>
                        <Link to="/catalogo/nuevo" className={layoutStyles.btnPrimarySmall ?? layoutStyles.segmentButton}>
                            <PlusCircle size={14} weight="bold" style={{ marginRight: 4 }} />
                            Nuevo producto
                        </Link>
                    </div>
                </div>
            </header>

            <div className={styles.page}>
                <div className={styles.container}>

                    {/* ── Barra de búsqueda + filtros ─────────────────────────── */}
                    <div className={styles.searchBar}>
                        <div className={styles.searchInputWrap}>
                            <MagnifyingGlass size={16} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Buscar por nombre, descripción o SKU…"
                                value={filtros.texto}
                                onChange={e => setFiltro("texto", e.target.value)}
                            />
                            {filtros.texto && (
                                <button type="button" className={styles.clearBtn} onClick={() => setFiltro("texto", "")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`${styles.filtrosToggle} ${panelFiltros ? styles.filtrosToggleActive : ""}`}
                            onClick={() => setPanelFiltros(p => !p)}
                        >
                            <Funnel size={15} weight={filtrosActivos ? "fill" : "regular"} />
                            Filtros
                            {filtrosActivos && <span className={styles.filtrosBadge} />}
                            {panelFiltros ? <CaretUp size={12} /> : <CaretDown size={12} />}
                        </button>

                        {filtrosActivos && (
                            <button type="button" className={styles.clearAllBtn} onClick={() => { setFiltros(FILTROS_VACIOS); setInputTalle(""); setInputColor(""); }}>
                                <X size={12} /> Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* ── Panel de filtros avanzados ────────────────────────────── */}
                    {panelFiltros && (
                        <div className={styles.filtrosPanel}>
                            <div className={styles.filtroGrid}>
                                {/* Tipo */}
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Tipo de producto</label>
                                    <select className={styles.filtroSelect} value={filtros.tipo} onChange={e => setFiltro("tipo", e.target.value)}>
                                        <option value="">Todos</option>
                                        {opcionesTipo.map(t => <option key={t} value={t}>{NOMBRE_TIPO[t] ?? t}</option>)}
                                    </select>
                                </div>

                                {/* Temporada */}
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Temporada</label>
                                    <select className={styles.filtroSelect} value={filtros.temporada} onChange={e => setFiltro("temporada", e.target.value)}>
                                        <option value="">Todas</option>
                                        {opcionesTemporada.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Precio mín/máx */}
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Precio mín $</label>
                                    <input className={styles.filtroInput} type="number" min="0" placeholder="ej: 10000" value={filtros.precioMin} onChange={e => setFiltro("precioMin", e.target.value)} />
                                </div>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Precio máx $</label>
                                    <input className={styles.filtroInput} type="number" min="0" placeholder="ej: 50000" value={filtros.precioMax} onChange={e => setFiltro("precioMax", e.target.value)} />
                                </div>

                                {/* Talles chips */}
                                <div className={styles.filtroField} style={{ gridColumn: "span 2" }}>
                                    <label className={styles.filtroLabel}>Talles (incluye variantes con)</label>
                                    <div className={styles.chipInput}>
                                        {filtros.talles.map(t => (
                                            <span key={t} className={styles.filtroChip}>
                                                {t}
                                                <button type="button" onClick={() => setFiltro("talles", filtros.talles.filter(x => x !== t))}><X size={10} /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text" placeholder="ej: 42, XL…"
                                            value={inputTalle}
                                            onChange={e => setInputTalle(e.target.value.toUpperCase())}
                                            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregarTalleFiltro(); } }}
                                            onBlur={agregarTalleFiltro}
                                            className={styles.chipInputInner}
                                        />
                                    </div>
                                </div>

                                {/* Colores chips */}
                                <div className={styles.filtroField} style={{ gridColumn: "span 2" }}>
                                    <label className={styles.filtroLabel}>Colores (incluye variantes con)</label>
                                    <div className={styles.chipInput}>
                                        {filtros.colores.map(c => (
                                            <span key={c} className={`${styles.filtroChip} ${styles.filtroChipColor}`}>
                                                {c}
                                                <button type="button" onClick={() => setFiltro("colores", filtros.colores.filter(x => x !== c))}><X size={10} /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text" placeholder="ej: Negro, Azul…"
                                            value={inputColor}
                                            onChange={e => setInputColor(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregarColorFiltro(); } }}
                                            onBlur={agregarColorFiltro}
                                            className={styles.chipInputInner}
                                        />
                                    </div>
                                </div>

                                {/* Atributo libre */}
                                <div className={styles.filtroField} style={{ gridColumn: "span 2" }}>
                                    <label className={styles.filtroLabel}>Atributo (busca en clave o valor)</label>
                                    <input className={styles.filtroInput} type="text" placeholder="ej: F11, Cuero sintético, Uso…" value={filtros.atributo} onChange={e => setFiltro("atributo", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Feedback de carga / error ─────────────────────────────── */}
                    {loading && (
                        <div className={styles.loadingWrap}>
                            <div className={styles.spinner} />
                            <span>Cargando catálogo…</span>
                        </div>
                    )}
                    {!loading && error && (
                        <div className={styles.errorAlert} role="alert">
                            <WarningCircle size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                            {error}
                        </div>
                    )}

                    {/* ── Contenido principal ───────────────────────────────────── */}
                    {!loading && !error && (
                        <>
                            {/* Empty state general */}
                            {productos.length === 0 && (
                                <div className={styles.empty}>
                                    <Package size={64} weight="thin" className={styles.emptyIcon} />
                                    <h2 className={styles.emptyTitle}>Tu catálogo está vacío</h2>
                                    <p className={styles.emptyText}>
                                        Cargá tu primer producto con su matriz de talles y colores.
                                    </p>
                                    <Link to="/catalogo/nuevo" className={styles.btnNuevo}>
                                        <PlusCircle size={18} weight="bold" />
                                        Cargar primer producto
                                    </Link>
                                </div>
                            )}

                            {/* Empty state de filtros */}
                            {productos.length > 0 && productosFiltrados.length === 0 && (
                                <div className={styles.empty}>
                                    <Funnel size={48} weight="thin" className={styles.emptyIcon} />
                                    <h2 className={styles.emptyTitle}>Sin resultados</h2>
                                    <p className={styles.emptyText}>Ningún producto coincide con los filtros aplicados.</p>
                                    <button type="button" className={styles.btnNuevo} onClick={() => setFiltros(FILTROS_VACIOS)}>
                                        <X size={16} /> Limpiar filtros
                                    </button>
                                </div>
                            )}

                            {/* Tabla */}
                            {productosFiltrados.length > 0 && (
                                <>
                                    {/* Stats */}
                                    <div className={styles.statsBar}>
                                        <span className={styles.statChip}>
                                            <Package size={14} />
                                            <strong>{productosFiltrados.length}</strong> producto{productosFiltrados.length !== 1 ? "s" : ""}
                                            {filtrosActivos && <span className={styles.statOf}> de {productos.length}</span>}
                                        </span>
                                        <span className={styles.statChip}>
                                            <Rows size={14} />
                                            <strong>{totalVariantes}</strong> variante{totalVariantes !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className={styles.tableWrap}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Tipo</th>
                                                    <th>Temporada</th>
                                                    <th style={{ textAlign: "right" }}>Precio base</th>
                                                    <th style={{ textAlign: "center" }}>Variantes</th>
                                                    <th>Talles disponibles</th>
                                                    <th>Colores</th>
                                                    <th style={{ textAlign: "center" }}>Stock total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productosFiltrados.map(p => (
                                                    <ProductoRow
                                                        key={p.id}
                                                        producto={p}
                                                        onClick={() => setProductoModal(p)}
                                                        onDelete={() => handleDelete(p.id, p.nombre)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Modal de detalle ─────────────────────────────────────────────── */}
            {productoModal && (
                <ProductoModal
                    producto={productoModal}
                    onClose={() => setProductoModal(null)}
                    onDelete={() => handleDelete(productoModal.id, productoModal.nombre)}
                />
            )}
        </>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Fila de la tabla
// ──────────────────────────────────────────────────────────────────────────────
function ProductoRow({ producto: p, onClick, onDelete }: { producto: ProductoConVariantes; onClick: () => void; onDelete: () => void }) {
    const tallesUnicos = [...new Set(p.variantes.map(v => v.talle))];
    const coloresUnicos = [...new Set(p.variantes.map(v => v.color))];
    const stockTotal = p.variantes.reduce((a, v) => a + (v.stockActual ?? 0), 0);

    return (
        <tr className={styles.tableRow} onClick={onClick} title="Ver detalle">
            <td>
                <div className={styles.cellNombre}>{p.nombre}</div>
                {p.descripcion && <div className={styles.cellDesc}>{p.descripcion}</div>}
            </td>
            <td><span className={styles.tipoBadge}>{NOMBRE_TIPO[p.tipoProducto] ?? p.tipoProducto}</span></td>
            <td className={styles.cellMuted}>{p.temporada || <span style={{ color: "var(--color-gray-500)", fontStyle: "italic" }}>—</span>}</td>
            <td style={{ textAlign: "right" }} className={styles.cellPrecio}>{fmt(p.precioBase)}</td>
            <td style={{ textAlign: "center" }}>
                <span className={styles.countBadge}>{p.variantes.length}</span>
            </td>
            <td>
                <div className={styles.chipList}>
                    {tallesUnicos.slice(0, 6).map(t => (
                        <span key={t} className={styles.talleChip}>{t}</span>
                    ))}
                    {tallesUnicos.length > 6 && <span className={styles.moreChip}>+{tallesUnicos.length - 6}</span>}
                </div>
            </td>
            <td>
                <div className={styles.chipList}>
                    {coloresUnicos.slice(0, 4).map(c => (
                        <span key={c} className={styles.colorChip}>{c}</span>
                    ))}
                    {coloresUnicos.length > 4 && <span className={styles.moreChip}>+{coloresUnicos.length - 4}</span>}
                </div>
            </td>
            <td style={{ textAlign: "center" }}>
                <span className={stockTotal > 0 ? styles.stockOk : styles.stockEmpty}>
                    {stockTotal}
                </span>
            </td>
            <td onClick={e => e.stopPropagation()}>
                <div className={styles.rowActions}>
                    <button type="button" className={styles.rowActionBtn} title="Ver detalle" onClick={onClick}>
                        <ArrowSquareOut size={14} />
                    </button>
                    <button type="button" className={`${styles.rowActionBtn} ${styles.rowActionDangerBtn || ""}`} style={{ color: "var(--color-danger)" }} title="Eliminar producto" onClick={onDelete}>
                        <Trash size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Modal de detalle
// ──────────────────────────────────────────────────────────────────────────────
function ProductoModal({ producto: p, onClose, onDelete }: { producto: ProductoConVariantes; onClose: () => void; onDelete: () => void }) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const tallesUnicos = [...new Set(p.variantes.map(v => v.talle))];
    const coloresUnicos = [...new Set(p.variantes.map(v => v.color))];
    const stockTotal = p.variantes.reduce((a, v) => a + (v.stockActual ?? 0), 0);

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Cerrar al hacer click en el overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                {/* Header del modal */}
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle}>{p.nombre}</h2>
                        <div className={styles.modalMeta}>
                            <span className={styles.tipoBadge}>{NOMBRE_TIPO[p.tipoProducto] ?? p.tipoProducto}</span>
                            {p.temporada && <span className={styles.temporadaBadge}>{p.temporada}</span>}
                            <span className={styles.modalPrecio}>{fmt(p.precioBase)} base</span>
                        </div>
                    </div>
                    <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                {/* Descripción */}
                {p.descripcion && <p className={styles.modalDesc}>{p.descripcion}</p>}

                {/* KPIs rápidos */}
                <div className={styles.modalKpis}>
                    <div className={styles.kpi}>
                        <span className={styles.kpiVal}>{p.variantes.length}</span>
                        <span className={styles.kpiLabel}>Variantes</span>
                    </div>
                    <div className={styles.kpi}>
                        <span className={styles.kpiVal}>{tallesUnicos.length}</span>
                        <span className={styles.kpiLabel}>Talles</span>
                    </div>
                    <div className={styles.kpi}>
                        <span className={styles.kpiVal}>{coloresUnicos.length}</span>
                        <span className={styles.kpiLabel}>Colores</span>
                    </div>
                    <div className={styles.kpi}>
                        <span className={`${styles.kpiVal} ${stockTotal > 0 ? styles.stockOk : styles.stockEmpty}`}>{stockTotal}</span>
                        <span className={styles.kpiLabel}>Stock total</span>
                    </div>
                </div>

                {/* Tabla de variantes */}
                <div className={styles.modalTableWrap}>
                    <table className={styles.modalTable}>
                        <thead>
                            <tr>
                                <th>Talle</th>
                                <th>Color</th>
                                <th>SKU</th>
                                <th style={{ textAlign: "right" }}>Costo</th>
                                <th style={{ textAlign: "right" }}>Precio esp.</th>
                                <th style={{ textAlign: "center" }}>Stock</th>
                                <th>Atributos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {p.variantes.map(v => {
                                const attrs = atributosDeVariante(v);
                                const hasAttrs = Object.keys(attrs).length > 0;
                                return (
                                    <tr key={v.id} className={styles.modalTableRow}>
                                        <td><span className={styles.talleChip}>{v.talle}</span></td>
                                        <td><span className={styles.colorChip}>{v.color}</span></td>
                                        <td className={styles.cellMuted}>{v.sku || <span style={{ color: "var(--color-gray-500)" }}>—</span>}</td>
                                        <td style={{ textAlign: "right" }} className={styles.cellMuted}>{v.precioCosto > 0 ? fmt(v.precioCosto) : "—"}</td>
                                        <td style={{ textAlign: "right" }}>{v.precioOverride ? <span className={styles.cellPrecio}>{fmt(v.precioOverride)}</span> : <span className={styles.cellMuted}>—</span>}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={(v.stockActual ?? 0) > 0 ? styles.stockOk : styles.stockEmpty}>
                                                {v.stockActual ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            {hasAttrs ? (
                                                <div className={styles.attrList}>
                                                    {Object.entries(attrs).map(([k, val]) => (
                                                        <span key={k} className={styles.attrChip}>{k}: {val}</span>
                                                    ))}
                                                </div>
                                            ) : <span className={styles.cellMuted}>—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer de acciones */}
                <div className={styles.modalFooter}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className={styles.modalBtnSecondary} onClick={onClose}>
                            Cerrar
                        </button>
                        <button type="button" className={`${styles.modalBtnSecondary} ${styles.modalBtnDanger || ""}`} style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={onDelete}>
                            <Trash size={15} /> Eliminar
                        </button>
                    </div>
                    <Link to={`/catalogo/editar/${p.id}`} className={styles.modalBtnPrimary} onClick={onClose}>
                        <PencilSimple size={15} weight="bold" />
                        Editar producto
                    </Link>
                </div>
            </div>
        </div>
    );
}
