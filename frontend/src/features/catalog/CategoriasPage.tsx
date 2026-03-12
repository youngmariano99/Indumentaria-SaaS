import { useState, useEffect, useMemo } from "react";
import {
    Folder, FolderOpen, CaretRight, CaretDown,
    Plus, PencilSimple, Trash, X, MagnifyingGlass, Funnel
} from "@phosphor-icons/react";
import { CategoryAttributesEditor } from "./components/CategoryAttributesEditor";
import { categoriasApi } from "./api/categoriasApi";
import type { CategoriaDto } from "./api/categoriasApi";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import baseStyles from "./CatalogoPage.module.css";
import styles from "./CategoriasPage.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// Utilidad: aplanar árbol para búsqueda (solo presentación)
// ─────────────────────────────────────────────────────────────────────────────
function aplanarArbol(cats: CategoriaDto[], nivel = 0): { cat: CategoriaDto; nivel: number }[] {
    let out: { cat: CategoriaDto; nivel: number }[] = [];
    for (const c of cats) {
        out.push({ cat: c, nivel });
        if (c.subcategorias?.length) out = out.concat(aplanarArbol(c.subcategorias, nivel + 1));
    }
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de Nodo Recursivo (árbol)
// ─────────────────────────────────────────────────────────────────────────────
function CategoriaNode({
    cat,
    onEdit,
    onDelete,
    onAddSub
}: {
    cat: CategoriaDto;
    onEdit: (c: CategoriaDto) => void;
    onDelete: (id: string, name: string) => void;
    onAddSub: (parentId: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = cat.subcategorias && cat.subcategorias.length > 0;

    return (
        <div className={styles.node}>
            <div className={styles.nodeHeader}>
                <div className={styles.nodeInfo}>
                    <button
                        className={styles.nodeToggle}
                        onClick={() => setExpanded(!expanded)}
                        style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                    >
                        {expanded ? <CaretDown size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
                    </button>
                    {expanded ? <FolderOpen size={20} color="var(--color-primary)" weight="fill" /> : <Folder size={20} color="var(--color-primary)" weight="fill" />}

                    <div className={styles.nodeDetails}>
                        <span className={styles.nodeName}>{cat.nombre}</span>
                        {(cat.codigoNcm || cat.descripcion) && (
                            <span className={styles.nodeMeta}>
                                {cat.codigoNcm && <span>NCM: {cat.codigoNcm}</span>}
                                {cat.descripcion && <span>{cat.descripcion}</span>}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.nodeActions}>
                    <button className={styles.iconBtn} onClick={() => onAddSub(cat.id)} title="Añadir subcategoría">
                        <Plus size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={() => onEdit(cat)} title="Editar categoría">
                        <PencilSimple size={16} />
                    </button>
                    <button className={styles.iconBtn + " " + styles.iconBtnDanger} onClick={() => onDelete(cat.id, cat.nombre)} title="Eliminar categoría">
                        <Trash size={16} />
                    </button>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className={styles.nodeChildren}>
                    {cat.subcategorias.map(sub => (
                        <CategoriaNode
                            key={sub.id}
                            cat={sub}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página Principal
// ─────────────────────────────────────────────────────────────────────────────
export function CategoriasPage() {
    const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros y paginación (solo UI, mismos datos)
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroSoloRaices, setFiltroSoloRaices] = useState(false);
    const [filtroConNcm, setFiltroConNcm] = useState<"all" | "yes" | "no">("all");
    const [panelFiltros, setPanelFiltros] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado del modal de formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        codigoNcm: "",
        parentCategoryId: "" as string | null,
        esquemaAtributosJson: "[]"
    });

    const initLoad = async () => {
        setLoading(true);
        try {
            const data = await categoriasApi.obtenerCategorias();
            setCategorias(data);
        } catch (error) {
            console.error(error);
            alert("Error cargando categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initLoad();
    }, []);

    // Lista filtrada (solo presentación, sin tocar API)
    const { listaFiltrada, vistaPlana, totalFiltrado } = useMemo(() => {
        const texto = filtroTexto.trim().toLowerCase();

        if (texto) {
            const planas = aplanarArbol(categorias);
            let filtradas = planas.filter(({ cat }) => {
                const matchNombre = cat.nombre.toLowerCase().includes(texto);
                const matchDesc = (cat.descripcion || "").toLowerCase().includes(texto);
                const matchNcm = (cat.codigoNcm || "").toLowerCase().includes(texto);
                if (!matchNombre && !matchDesc && !matchNcm) return false;
                if (filtroConNcm === "yes" && !cat.codigoNcm) return false;
                if (filtroConNcm === "no" && cat.codigoNcm) return false;
                return true;
            });
            if (filtroSoloRaices) filtradas = filtradas.filter(({ nivel }) => nivel === 0);
            return { listaFiltrada: filtradas, vistaPlana: true, totalFiltrado: filtradas.length };
        }

        let raices = categorias;
        if (filtroConNcm === "yes") raices = raices.filter(c => c.codigoNcm);
        if (filtroConNcm === "no") raices = raices.filter(c => !c.codigoNcm);
        return { listaFiltrada: raices, vistaPlana: false, totalFiltrado: raices.length };
    }, [categorias, filtroTexto, filtroSoloRaices, filtroConNcm]);

    const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / itemsPerPage));
    const paginaSegura = Math.min(Math.max(1, paginaActual), totalPaginas);
    const desde = (paginaSegura - 1) * itemsPerPage;
    const hasta = Math.min(desde + itemsPerPage, totalFiltrado);

    const listaPaginada = useMemo(() => {
        if (vistaPlana) return (listaFiltrada as { cat: CategoriaDto; nivel: number }[]).slice(desde, hasta);
        return (listaFiltrada as CategoriaDto[]).slice(desde, hasta);
    }, [listaFiltrada, vistaPlana, desde, hasta]);

    const filtrosActivos = filtroTexto.trim() || filtroConNcm !== "all" || filtroSoloRaices;

    const handleCreateRoot = () => {
        setModoEdicion(false);
        setFormData({ id: "", nombre: "", descripcion: "", codigoNcm: "", parentCategoryId: null, esquemaAtributosJson: "[]" });
        setModalOpen(true);
    };

    const handleAddSub = (parentId: string) => {
        setModoEdicion(false);
        setFormData({ id: "", nombre: "", descripcion: "", codigoNcm: "", parentCategoryId: parentId, esquemaAtributosJson: "[]" });
        setModalOpen(true);
    };

    const handleEdit = (cat: CategoriaDto) => {
        setModoEdicion(true);
        setFormData({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || "",
            codigoNcm: cat.codigoNcm || "",
            parentCategoryId: cat.parentCategoryId,
            esquemaAtributosJson: cat.esquemaAtributosJson || "[]"
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar categoría "${name}" y todo su contenido?`)) return;
        try {
            await categoriasApi.eliminarCategoria(id);
            initLoad();
        } catch (e: any) {
            alert(e?.response?.data?.mensaje || "No se puede eliminar la categoría.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                codigoNcm: formData.codigoNcm,
                parentCategoryId: formData.parentCategoryId || null,
                esquemaAtributosJson: formData.esquemaAtributosJson
            };

            if (modoEdicion) {
                await categoriasApi.editarCategoria(formData.id, payload);
            } else {
                await categoriasApi.crearCategoria(payload);
            }
            setModalOpen(false);
            initLoad();
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar la categoría.");
        }
    };

    const limpiarFiltros = () => {
        setFiltroTexto("");
        setFiltroConNcm("all");
        setFiltroSoloRaices(false);
        setPaginaActual(1);
    };

    return (
        <>
            <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                        <h1>Árbol de Categorías</h1>
                        <p>Organizá tu catálogo con niveles jerárquicos y NCM.</p>
                    </div>
                    <div className={layoutStyles.topbarControls}>
                        <button onClick={handleCreateRoot} className={layoutStyles.btnPrimarySmall ?? layoutStyles.segmentButton ?? styles.btnPrimary}>
                            <Plus size={14} weight="bold" style={{ marginRight: 4 }} />
                            Nueva Categoría Raíz
                        </button>
                    </div>
                </div>
            </header>

            <div className={baseStyles.page}>
                <div className={baseStyles.container}>
                    {/* Barra de búsqueda y filtros */}
                    <div className={baseStyles.searchBar}>
                        <div className={baseStyles.searchInputWrap}>
                            <MagnifyingGlass size={18} className={baseStyles.searchIcon} />
                            <input
                                className={baseStyles.searchInput}
                                type="text"
                                placeholder="Buscar por nombre, descripción o NCM..."
                                value={filtroTexto}
                                onChange={e => { setFiltroTexto(e.target.value); setPaginaActual(1); }}
                            />
                            {filtroTexto && (
                                <button type="button" className={baseStyles.clearBtn} onClick={() => { setFiltroTexto(""); setPaginaActual(1); }}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`${baseStyles.filtrosToggle} ${panelFiltros ? baseStyles.filtrosToggleActive : ""}`}
                            onClick={() => setPanelFiltros(p => !p)}
                        >
                            <Funnel size={15} weight={filtrosActivos ? "fill" : "regular"} />
                            Filtros
                            {filtrosActivos && <span className={baseStyles.filtrosBadge} />}
                            {panelFiltros ? <CaretDown size={12} /> : <CaretRight size={12} />}
                        </button>

                        {filtrosActivos && (
                            <button type="button" className={baseStyles.clearAllBtn} onClick={limpiarFiltros}>
                                <X size={12} /> Limpiar
                            </button>
                        )}
                    </div>

                    {/* Panel de filtros */}
                    {panelFiltros && (
                        <div className={baseStyles.filtrosPanel}>
                            <div className={baseStyles.filtroGrid}>
                                <div className={baseStyles.filtroField}>
                                    <label className={baseStyles.filtroLabel}>Código NCM</label>
                                    <select
                                        className={baseStyles.filtroSelect}
                                        value={filtroConNcm}
                                        onChange={e => { setFiltroConNcm(e.target.value as "all" | "yes" | "no"); setPaginaActual(1); }}
                                    >
                                        <option value="all">Todas</option>
                                        <option value="yes">Con NCM</option>
                                        <option value="no">Sin NCM</option>
                                    </select>
                                </div>
                                <div className={baseStyles.filtroField}>
                                    <div className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            id="soloRaices"
                                            checked={filtroSoloRaices}
                                            onChange={e => { setFiltroSoloRaices(e.target.checked); setPaginaActual(1); }}
                                        />
                                        <label htmlFor="soloRaices">Solo raíces</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className={baseStyles.loadingWrap}>
                            <div className={baseStyles.spinner} />
                            <span>Cargando categorías...</span>
                        </div>
                    ) : categorias.length === 0 ? (
                        <div className={baseStyles.empty}>
                            <FolderOpen size={48} weight="thin" className={baseStyles.emptyIcon} />
                            <h2 className={baseStyles.emptyTitle}>Tu catálogo aún no tiene categorías.</h2>
                            <p className={baseStyles.emptyText}>Crea la primera categoría para organizar tu catálogo.</p>
                            <button onClick={handleCreateRoot} className={baseStyles.btnNuevo}>
                                <Plus size={18} /> Crear la primera
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={baseStyles.statsBar}>
                                <span className={baseStyles.statChip}>
                                    <strong>{totalFiltrado}</strong> categoría{totalFiltrado !== 1 ? "s" : ""}
                                    {totalFiltrado !== categorias.length && " (filtradas)"}
                                </span>
                                <div className={styles.perPageWrap}>
                                    <label htmlFor="perPage">Por página</label>
                                    <select
                                        id="perPage"
                                        className={styles.perPageSelect}
                                        value={itemsPerPage}
                                        onChange={e => { setItemsPerPage(Number(e.target.value)); setPaginaActual(1); }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            {totalFiltrado === 0 ? (
                                <div className={baseStyles.empty}>
                                    <Funnel size={48} weight="thin" className={baseStyles.emptyIcon} />
                                    <h2 className={baseStyles.emptyTitle}>Sin resultados</h2>
                                    <p className={baseStyles.emptyText}>Ninguna categoría coincide con los filtros aplicados.</p>
                                    <button type="button" className={baseStyles.btnNuevo} onClick={limpiarFiltros}>
                                        <X size={16} /> Limpiar filtros
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.treeCard}>
                                    {vistaPlana ? (
                                        <div className={styles.flatList}>
                                            {(listaPaginada as { cat: CategoriaDto; nivel: number }[]).map(({ cat, nivel }) => (
                                                <div
                                                    key={cat.id}
                                                    className={`${styles.flatItem} ${[styles.flatItemIndent0, styles.flatItemIndent1, styles.flatItemIndent2, styles.flatItemIndent3][Math.min(nivel, 3)]}`}
                                                >
                                                    <div className={styles.nodeDetails}>
                                                        <span className={styles.nodeName}>{cat.nombre}</span>
                                                        {(cat.codigoNcm || cat.descripcion) && (
                                                            <span className={styles.nodeMeta}>
                                                                {cat.codigoNcm && <span>NCM: {cat.codigoNcm}</span>}
                                                                {cat.descripcion && <span>{cat.descripcion}</span>}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={styles.nodeActions} style={{ opacity: 1 }}>
                                                        <button className={styles.iconBtn} onClick={() => handleAddSub(cat.id)} title="Añadir subcategoría"><Plus size={16} /></button>
                                                        <button className={styles.iconBtn} onClick={() => handleEdit(cat)} title="Editar"><PencilSimple size={16} /></button>
                                                        <button className={styles.iconBtn + " " + styles.iconBtnDanger} onClick={() => handleDelete(cat.id, cat.nombre)} title="Eliminar"><Trash size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.treeWrap}>
                                            {(listaPaginada as CategoriaDto[]).map(c => (
                                                <CategoriaNode
                                                    key={c.id}
                                                    cat={c}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onAddSub={handleAddSub}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Paginación */}
                                    {totalPaginas > 1 && (
                                        <div className={baseStyles.statsBar} style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-gray-100)" }}>
                                            <span className={baseStyles.statChip}>
                                                {desde + 1}–{hasta} de {totalFiltrado}
                                            </span>
                                            <div className={styles.pagination}>
                                                <button
                                                    type="button"
                                                    className={styles.paginationBtn}
                                                    disabled={paginaSegura <= 1}
                                                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                                >
                                                    Anterior
                                                </button>
                                                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                                                    .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaSegura) <= 1)
                                                    .map((p, idx, arr) => (
                                                        <span key={p} style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                                                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: "0 4px", color: "var(--color-gray-400)" }}>…</span>}
                                                            <button
                                                                type="button"
                                                                className={`${styles.paginationBtn} ${p === paginaSegura ? styles.paginationBtnActive : ""}`}
                                                                onClick={() => setPaginaActual(p)}
                                                            >
                                                                {p}
                                                            </button>
                                                        </span>
                                                    ))}
                                                <button
                                                    type="button"
                                                    className={styles.paginationBtn}
                                                    disabled={paginaSegura >= totalPaginas}
                                                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal ABM */}
            {modalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{modoEdicion ? "Editar Categoría" : "Nueva Categoría"}</h2>
                            <button type="button" className={styles.iconBtn} onClick={() => setModalOpen(false)} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nombre</label>
                                <input
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Remeras"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Descripción (opcional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Cod. NCM Mercosur (opcional)</label>
                                <input
                                    value={formData.codigoNcm}
                                    onChange={e => setFormData({ ...formData, codigoNcm: e.target.value })}
                                    placeholder="Ej. 6205.20.00"
                                />
                            </div>

                            <CategoryAttributesEditor 
                                esquemaJson={formData.esquemaAtributosJson}
                                onChange={(val) => setFormData({ ...formData, esquemaAtributosJson: val })}
                            />

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnSecondary} onClick={() => setModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnPrimary}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
