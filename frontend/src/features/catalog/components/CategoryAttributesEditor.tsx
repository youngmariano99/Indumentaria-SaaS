import { useState, useEffect } from "react";
import { CheckCircle, Circle, Spinner } from "@phosphor-icons/react";
import { ajustesApi } from "../../ajustes/api/ajustesApi";
import styles from "../CategoriasPage.module.css";

interface AtributoSugerido {
    id: string;
    label: string;
}

interface Props {
    esquemaJson: string;
    onChange: (nuevoEsquema: string) => void;
}

export function CategoryAttributesEditor({ esquemaJson, onChange }: Props) {
    const [gruposDisponibles, setGruposDisponibles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Parsear el esquema actual
    const esquemaActual: AtributoSugerido[] = JSON.parse(esquemaJson || "[]");

    useEffect(() => {
        const loadGrupos = async () => {
            try {
                const data = await ajustesApi.obtenerDiccionario();
                // Extraer grupos únicos (Medida, Material, etc.)
                const grupos = Array.from(new Set(data.map(a => a.grupo)));
                setGruposDisponibles(grupos);
            } catch (error) {
                console.error("Error cargando diccionario para categorías", error);
            } finally {
                setLoading(false);
            }
        };
        loadGrupos();
    }, []);

    const toggleGrupo = (grupo: string) => {
        let nuevoEsquema: AtributoSugerido[];
        if (esquemaActual.some(a => a.id === grupo)) {
            nuevoEsquema = esquemaActual.filter(a => a.id !== grupo);
        } else {
            nuevoEsquema = [...esquemaActual, { id: grupo, label: grupo }];
        }
        onChange(JSON.stringify(nuevoEsquema));
    };

    if (loading) return <div className={styles.loadingSmall}><Spinner className={styles.spinner} /> Cargando atributos...</div>;

    return (
        <div className={styles.attributeEditor}>
            <label className={styles.fieldLabel}>Atributos requeridos para productos en esta categoría:</label>
            <p className={styles.fieldHelp}>Los productos creados aquí pedirán estos datos obligatoriamente.</p>
            
            <div className={styles.attributeGrid}>
                {gruposDisponibles.map(grupo => {
                    const isSelected = esquemaActual.some(a => a.id === grupo);
                    return (
                        <button
                            key={grupo}
                            type="button"
                            className={`${styles.attributeChip} ${isSelected ? styles.attributeChipActive : ""}`}
                            onClick={() => toggleGrupo(grupo)}
                        >
                            {isSelected ? <CheckCircle weight="fill" size={18} /> : <Circle size={18} />}
                            {grupo}
                        </button>
                    );
                })}
            </div>
            {gruposDisponibles.length === 0 && (
                <p className={styles.noAttributes}>No hay atributos configurados en el sistema. Configúralos en Ajustes.</p>
            )}
        </div>
    );
}
