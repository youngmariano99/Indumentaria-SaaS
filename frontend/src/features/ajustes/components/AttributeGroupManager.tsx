import { useState, useEffect } from "react";
import { Plus, X, Spinner } from "@phosphor-icons/react";
import type { AtributoConfiguracionDto } from "../api/ajustesApi";
import { ajustesApi } from "../api/ajustesApi";
import styles from "../AjustesPage.module.css";

interface Props {
    grupo: string;
    titulo: string;
    descripcion?: string;
}

export function AttributeGroupManager({ grupo, titulo, descripcion }: Props) {
    const [atributos, setAtributos] = useState<AtributoConfiguracionDto[]>([]);
    const [nuevoValor, setNuevoValor] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarAtributos();
    }, [grupo]);

    const cargarAtributos = async () => {
        try {
            setLoading(true);
            const data = await ajustesApi.obtenerDiccionario(grupo);
            setAtributos(data);
        } catch (error) {
            console.error('Error al cargar atributos', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgregar = async (e: React.FormEvent) => {
        e.preventDefault();
        const valorAInsertar = nuevoValor.trim();
        if (!valorAInsertar) return;

        setNuevoValor("");

        // Optimistic Update
        const tempId = Date.now().toString();
        const tempAtributo: AtributoConfiguracionDto = {
            id: tempId,
            grupo,
            valor: valorAInsertar,
            orden: atributos.length
        };

        setAtributos(prev => [...prev, tempAtributo]);

        try {
            const dbId = await ajustesApi.crearDiccionario(grupo, valorAInsertar);
            setAtributos(prev => prev.map(a => a.id === tempId ? { ...a, id: dbId } : a));
        } catch (error) {
            console.error('Error al guardar atributo', error);
            // Revertir optimistic UI en caso de error
            setAtributos(prev => prev.filter(a => a.id !== tempId));
        }
    };

    const handleEliminar = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar el atributo? Puede estar en uso.")) return;

        // Optimistic Update
        const atributosPrevios = [...atributos];
        setAtributos(prev => prev.filter(a => a.id !== id));

        try {
            await ajustesApi.eliminarDiccionario(id);
        } catch (error) {
            console.error('Error al eliminar', error);
            // Revertir
            setAtributos(atributosPrevios);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingRow}>
                <Spinner size={20} className={styles.spinIcon} />
                <span>Cargando diccionario de {titulo}…</span>
            </div>
        );
    }

    return (
        <div className={styles.editor} style={{ marginBottom: "2rem" }}>
            <div className={styles.chipsEditorHeader}>
                <span className={styles.chipsEditorTitle}>
                    {titulo}
                </span>
            </div>
            
            {descripcion && (
                <p className={styles.chipsHint} style={{ marginBottom: "1rem" }}>
                    {descripcion}
                </p>
            )}

            <div className={styles.chipsGrid}>
                {atributos.map(attr => (
                    <span key={attr.id} className={styles.chip}>
                        {attr.valor}
                        <button
                            type="button"
                            className={styles.chipRemove}
                            onClick={() => handleEliminar(attr.id)}
                            aria-label={`Quitar ${attr.valor}`}
                        >
                            <X size={11} weight="bold" />
                        </button>
                    </span>
                ))}
            </div>

            <form className={styles.addRow} onSubmit={handleAgregar}>
                <input
                    className={styles.addInput}
                    type="text"
                    placeholder={`Insertar un(a) nuevo(a) ${grupo.toLowerCase()}...`}
                    value={nuevoValor}
                    onChange={e => setNuevoValor(e.target.value)}
                />
                <button 
                    type="submit" 
                    className={styles.addBtn}
                    disabled={!nuevoValor.trim()}
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                    <Plus size={14} weight="bold" />
                    Agregar
                </button>
            </form>
        </div>
    );
}
