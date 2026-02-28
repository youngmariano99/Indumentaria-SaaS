import { useState, useEffect } from "react";
import {
    Folder, FolderOpen, CaretRight, CaretDown,
    Plus, PencilSimple, Trash, X
} from "@phosphor-icons/react";
import { categoriasApi } from "./api/categoriasApi";
import type { CategoriaDto } from "./api/categoriasApi";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import styles from "./CategoriasPage.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// Componente de Nodo Recursivo
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
                    {expanded ? <FolderOpen size={20} color="#3b82f6" weight="fill" /> : <Folder size={20} color="#3b82f6" weight="fill" />}

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

    // Estado del modal de formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        codigoNcm: "",
        parentCategoryId: "" as string | null
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

    const handleCreateRoot = () => {
        setModoEdicion(false);
        setFormData({ id: "", nombre: "", descripcion: "", codigoNcm: "", parentCategoryId: null });
        setModalOpen(true);
    };

    const handleAddSub = (parentId: string) => {
        setModoEdicion(false);
        setFormData({ id: "", nombre: "", descripcion: "", codigoNcm: "", parentCategoryId: parentId });
        setModalOpen(true);
    };

    const handleEdit = (cat: CategoriaDto) => {
        setModoEdicion(true);
        setFormData({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || "",
            codigoNcm: cat.codigoNcm || "",
            parentCategoryId: cat.parentCategoryId
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
                parentCategoryId: formData.parentCategoryId || null
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

    return (
        <>
            <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                        <h1>Árbol de Categorías</h1>
                        <p>Organizá tu catálogo con niveles jerárquicos y NCM.</p>
                    </div>
                    <div className={layoutStyles.topbarControls}>
                        <button onClick={handleCreateRoot} className={layoutStyles.btnPrimarySmall ?? layoutStyles.segmentButton}>
                            <Plus size={14} weight="bold" style={{ marginRight: 4 }} />
                            Nueva Categoría Raíz
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.page}>
                <div className={styles.container}>
                    {loading ? (
                        <p>Cargando árbol de categorías...</p>
                    ) : (
                        <div className={styles.treeWrap}>
                            {categorias.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FolderOpen size={48} weight="thin" color="#94a3b8" />
                                    <p>Tu catálogo aún no tiene categorías.</p>
                                    <button onClick={handleCreateRoot} className={layoutStyles.btnPrimarySmall} style={{ margin: "1rem auto" }}>Crear la primera</button>
                                </div>
                            ) : (
                                categorias.map(c => (
                                    <CategoriaNode
                                        key={c.id}
                                        cat={c}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAddSub={handleAddSub}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal ABM */}
            {modalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{modoEdicion ? "Editar Categoría" : "Nueva Categoría"}</h2>
                            <button className={styles.iconBtn} onClick={() => setModalOpen(false)}>
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
                                <label>Descripción (Opcional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Cod. NCM Mercosur (Opcional)</label>
                                <input
                                    value={formData.codigoNcm}
                                    onChange={e => setFormData({ ...formData, codigoNcm: e.target.value })}
                                    placeholder="Ej. 6205.20.00"
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={layoutStyles.btnSecondarySmall ?? styles.iconBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={layoutStyles.btnPrimarySmall}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
