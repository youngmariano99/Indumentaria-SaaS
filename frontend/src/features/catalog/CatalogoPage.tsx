import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Package,
    Plus,
    MagnifyingGlass,
    X,
    CaretUp,
    Funnel,
    PencilSimple,
    ArrowSquareOut,
    Trash,
    UploadSimple,
    MagnifyingGlassMinus,
    WarningCircle,
    Printer
} from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import type { ProductoConVariantes, VarianteResumen } from "./types";
import { NOMBRE_TIPO } from "./data/tallesPorTipo";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import styles from "./CatalogoPage.module.css";
import { ModalImpresionEtiquetas } from "./components/ModalImpresionEtiquetas";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { useSmartDefaults } from "../../shared/hooks/useSmartDefaults";
import { useFeedbackStore } from "../../shared/hooks/useFeedback";
import { useRubro } from "../../hooks/useRubro";
import { Pagination } from "../../components/ui";

const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

interface Filtros {
    texto: string;
    temporada: string;
    tipo: string;
    talles: string[];
    colores: string[];
    precioMin: string;
    precioMax: string;
    atributo: string;
}

const FILTROS_VACIOS: Filtros = {
    texto: "", temporada: "", tipo: "",
    talles: [], colores: [],
    precioMin: "", precioMax: "",
    atributo: "",
};

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

export function CatalogoPage() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
    const [panelFiltros, setPanelFiltros] = useState(false);
    const [productoModal, setProductoModal] = useState<ProductoConVariantes | null>(null);
    const [etiquetasParaImprimir, setEtiquetasParaImprimir] = useState<any[] | null>(null);
    const { t, isIndumentaria } = useRubro();
    const { translateLabel } = useSmartDefaults();

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

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

    const { addToast } = useFeedbackStore();

    const handleDelete = async (id: string, nombre: string) => {
        // En lugar de confirm(), aplicamos la acción y damos opción de deshacer (o confirmación ergonómica)
        // Pero para "Borrar Catálogo" o similar sí usaríamos barreras. 
        // Para un producto individual, seguimos el principio de reversibilidad.
        
        try {
            await catalogApi.eliminarProducto(id);
            cargarCatalogo();
            setProductoModal(null);

            addToast({
                message: `Producto "${nombre}" eliminado.`,
                type: 'info',
                onUndo: async () => {
                    // Aquí iría la lógica de restaurar si el backend lo soporta, 
                    // o simplemente informar que fue una baja lógica.
                    // Como es baja lógica, podríamos tener un endpoint 'restaurar'.
                    alert("Función de restaurar próximamente disponible.");
                }
            });
        } catch (e: any) {
            setError("Error al eliminar el producto.");
        }
    };

    const opcionesTemporada = useMemo(() =>
        [...new Set(productos.map(p => p.temporada).filter(Boolean))], [productos]);
    const opcionesTipo = useMemo(() =>
        [...new Set(productos.map(p => p.tipoProducto).filter(Boolean))], [productos]);

    const productosFiltrados = useMemo(() =>
        productos.filter(p => productoMatchFiltros(p, filtros)),
        [productos, filtros]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filtros]);

    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    const productosPaginados = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return productosFiltrados.slice(start, start + itemsPerPage);
    }, [productosFiltrados, currentPage, itemsPerPage]);

    const filtrosActivos = useMemo(() =>
        !!(filtros.texto || filtros.temporada || filtros.tipo ||
        filtros.talles.length > 0 || filtros.colores.length > 0 ||
        filtros.precioMin || filtros.precioMax || filtros.atributo),
        [filtros]
    );

    const setFiltro = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
        setFiltros(prev => ({ ...prev, [key]: value }));


    const totalVariantes = productosFiltrados.reduce((a, p) => a + p.variantes.length, 0);

    return (
        <>
            <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                        <h1>{t('Catalogo', 'Catálogo de productos')}</h1>
                        <p>{t('GestionCatalogoDesc', 'Gestioná los productos y su matriz de variantes.')}</p>
                    </div>
                </div>
            </header>

            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.searchBar}>
                        <div className={styles.searchInputWrap}>
                            <MagnifyingGlass size={16} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder={`Buscar por nombre o ${translateLabel('sku', 'SKU')}...`}
                                value={filtros.texto}
                                onChange={e => setFiltro("texto", e.target.value)}
                            />
                        </div>

                        <Button 
                            variant="secondary" 
                            onClick={() => setPanelFiltros(p => !p)}
                            icon={panelFiltros ? <CaretUp size={12} /> : <Funnel size={15} />}
                        >
                            Filtros {filtrosActivos && "•"}
                        </Button>

                        <div style={{ marginLeft: 'auto' }}>
                            <Link to="/catalogo/nuevo">
                                <Button variant="primary" icon={<Plus size={18} />} educational>
                                    Nuevo Producto
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {panelFiltros && (
                        <div className={styles.filtrosPanel}>
                            <div className={styles.filtroGrid}>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Tipo de producto</label>
                                    <select className={styles.filtroSelect} value={filtros.tipo} onChange={e => setFiltro("tipo", e.target.value)}>
                                        <option value="">Todos</option>
                                        {opcionesTipo.map(t => <option key={t} value={t}>{NOMBRE_TIPO[t] ?? t}</option>)}
                                    </select>
                                </div>
                                {isIndumentaria && (
                                    <div className={styles.filtroField}>
                                        <label className={styles.filtroLabel}>{translateLabel('category', 'Temporada')}</label>
                                        <select className={styles.filtroSelect} value={filtros.temporada} onChange={e => setFiltro("temporada", e.target.value)}>
                                            <option value="">Todas</option>
                                            {opcionesTemporada.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Precio mín $</label>
                                    <input className={styles.filtroInput} type="number" min="0" value={filtros.precioMin} onChange={e => setFiltro("precioMin", e.target.value)} />
                                </div>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Precio máx $</label>
                                    <input className={styles.filtroInput} type="number" min="0" value={filtros.precioMax} onChange={e => setFiltro("precioMax", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorAlert} role="alert">
                            <WarningCircle size={18} style={{ marginRight: 8 }} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className={styles.loadingWrap}>Cargando catálogo…</div>
                    ) : (
                        <>
                            {productos.length === 0 ? (
                                <EmptyState 
                                    illustration={<Package size={80} weight="thin" />}
                                    title="Tu catálogo está vacío"
                                    description="Cargá tus productos para empezar a vender. Podés hacerlo manualmente o mediante una planilla Excel."
                                    educationalTip="Si venís de otro sistema, usá la función de importación para ahorrar horas de carga."
                                    actionLabel="Cargar mi primer producto"
                                    onAction={() => navigate('/catalogo/nuevo')}
                                />
                            ) : productosFiltrados.length === 0 ? (
                                <EmptyState 
                                    illustration={<MagnifyingGlassMinus size={64} weight="thin" />}
                                    title="Sin coincidencias"
                                    description="No encontramos productos con los filtros actuales."
                                    actionLabel="Limpiar todos los filtros"
                                    onAction={() => setFiltros(FILTROS_VACIOS)}
                                />
                            ) : (
                                <>
                                    <div className={styles.statsBar}>
                                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                            <span className={styles.statChip}>
                                                <strong>{productosFiltrados.length}</strong> productos
                                            </span>
                                            <span className={styles.statChip}>
                                                <strong>{totalVariantes}</strong> variantes
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                            <Link to={isIndumentaria ? '/catalogo/importar' : '/catalogo/importar-ferreteria'}>
                                                <Button variant="outline" size="sm" icon={<UploadSimple size={16} />}>
                                                    Importar
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className={styles.tableWrap}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Tipo</th>
                                                    {isIndumentaria && <th>{translateLabel('category', 'Temporada')}</th>}
                                                    <th style={{ textAlign: "right" }}>Precio base</th>
                                                    <th style={{ textAlign: "center" }}>Variantes</th>
                                                    <th>{translateLabel('variant', 'Talle/Color')}</th>
                                                    <th style={{ textAlign: "center" }}>Stock total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productosPaginados.map(p => (
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

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                        totalItems={productosFiltrados.length}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {productoModal && (
                <ProductoModal
                    producto={productoModal}
                    onClose={() => setProductoModal(null)}
                    onDelete={() => handleDelete(productoModal.id, productoModal.nombre)}
                    onPrint={(etiquetas) => setEtiquetasParaImprimir(etiquetas)}
                />
            )}

            {etiquetasParaImprimir && (
                <ModalImpresionEtiquetas
                    etiquetas={etiquetasParaImprimir}
                    onClose={() => setEtiquetasParaImprimir(null)}
                />
            )}
        </>
    );
}

function ProductoRow({ producto: p, onClick, onDelete }: { producto: ProductoConVariantes; onClick: () => void; onDelete: () => void }) {
    const { isIndumentaria } = useRubro();
    const stockTotal = p.variantes.reduce((a, v) => a + (v.stockActual ?? 0), 0);

    return (
        <tr className={styles.tableRow} onClick={onClick}>
            <td>
                <div className={styles.cellNombre}>{p.nombre}</div>
                {p.descripcion && <div className={styles.cellDesc}>{p.descripcion}</div>}
            </td>
            <td><span className={styles.tipoBadge}>{NOMBRE_TIPO[p.tipoProducto] ?? p.tipoProducto}</span></td>
            {isIndumentaria && <td className={styles.cellMuted}>{p.temporada || "—"}</td>}
            <td style={{ textAlign: "right" }} className={styles.cellPrecio}>{fmt(p.precioBase)}</td>
            <td style={{ textAlign: "center" }}>
                <span className={styles.countBadge}>{p.variantes.length}</span>
            </td>
            <td>
                <div className={styles.chipList}>
                   {[...new Set(p.variantes.map(v => `${v.talle}/${v.color}`))].slice(0, 3).map(tc => (
                       <span key={tc} className={styles.talleChip}>{tc}</span>
                   ))}
                   {p.variantes.length > 3 && <span className={styles.moreChip}>...</span>}
                </div>
            </td>
            <td style={{ textAlign: "center" }}>
                <span className={stockTotal > 0 ? styles.stockOk : styles.stockEmpty}>
                    {stockTotal}
                </span>
            </td>
            <td onClick={e => e.stopPropagation()}>
                <div className={styles.rowActions}>
                    <button className={styles.rowActionBtn} onClick={onClick}><ArrowSquareOut size={14} /></button>
                    <button className={styles.rowActionBtn} onClick={onDelete} style={{ color: 'var(--color-error)' }}><Trash size={14} /></button>
                </div>
            </td>
        </tr>
    );
}

function ProductoModal({ producto: p, onClose, onDelete, onPrint }: { producto: ProductoConVariantes; onClose: () => void; onDelete: () => void; onPrint: (etiquetas: any[]) => void }) {
    const { t } = useRubro();
    const { translateLabel } = useSmartDefaults();
    const overlayRef = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.modalOverlay} ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle}>{p.nombre}</h2>
                        <span className={styles.tipoBadge}>{NOMBRE_TIPO[p.tipoProducto] ?? p.tipoProducto}</span>
                    </div>
                    <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.modalTableWrap}>
                    <table className={styles.modalTable}>
                        <thead>
                            <tr>
                                <th>{translateLabel('variant', 'Variante')}</th>
                                <th>{translateLabel('sku', 'SKU')}</th>
                                <th style={{ textAlign: "right" }}>Costo</th>
                                <th style={{ textAlign: "center" }}>Stock</th>
                                <th>Atributos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {p.variantes.map(v => (
                                <tr key={v.id} className={styles.modalTableRow}>
                                    <td>{v.talle} / {v.color}</td>
                                    <td>{v.sku || "—"}</td>
                                    <td style={{ textAlign: "right" }}>{fmt(v.precioCosto)}</td>
                                    <td style={{ textAlign: "center" }}>{v.stockActual ?? 0}</td>
                                    <td>{v.atributosJson ? "Ver detalles" : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.modalFooter}>
                    <Button variant="outline" onClick={onDelete} icon={<Trash size={16} />}>Eliminar</Button>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto' }}>
                        <Button 
                            variant="outline" 
                            icon={<Printer size={16} />} 
                            onClick={() => {
                                const etiquetas = p.variantes.map(v => ({
                                    sku: v.sku,
                                    nombre: p.nombre,
                                    talle: v.talle,
                                    color: v.color,
                                    precio: p.precioBase
                                }));
                                onPrint(etiquetas);
                            }}
                        >
                            {t('Imprimir', 'Imprimir')}
                        </Button>
                        <Link to={`/catalogo/editar/${p.id}`}>
                            <Button variant="primary" icon={<PencilSimple size={15} />}>Editar</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
