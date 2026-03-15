import { useState } from 'react';
import { useRubroStore } from '../../../store/rubroStore';
import { GridNine, Percent, ArrowsLeftRight, ShoppingCartSimple, WarningCircle, Check } from "@phosphor-icons/react";
import styles from './RubroMutationPanel.module.css';
import { providersApi } from '../api/providersApi';
import { catalogApi } from '../../catalog/api/catalogApi';

interface RubroMutationPanelProps {
    proveedorId?: string;
    currentDescription?: string;
    onSelectProduct?: (match: any) => void;
}

export function RubroMutationPanel({ proveedorId, currentDescription, onSelectProduct }: RubroMutationPanelProps) {
    const rubroSlug = useRubroStore(s => s.rubroSlug);
    const [percentage, setPercentage] = useState(10);
    const [isUpdating, setIsUpdating] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleUpdateCosts = async () => {
        if (!proveedorId) {
            alert("Seleccione un proveedor primero.");
            return;
        }
        if (!confirm(`¿Confirmás aumentar los costos de TODOS los productos de este proveedor un ${percentage}%?`)) {
            return;
        }

        setIsUpdating(true);
        try {
            const success = await providersApi.updateCosts(proveedorId, percentage);
            if (success) {
                alert("Costos actualizados correctamente.");
            } else {
                alert("No se encontraron productos vinculados a este proveedor para actualizar.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al actualizar costos.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGetSuggestions = async () => {
        try {
            const data = await catalogApi.getNoStock();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error(error);
        }
    };

    if (rubroSlug === 'indumentaria') {
        return (
            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <GridNine size={20} weight="bold" />
                    <h3>Compra por Curvas (Matriz Talles/Colores)</h3>
                </div>
                <div className={styles.matrixContainer}>
                    <table className={styles.matrixTable}>
                        <thead>
                            <tr>
                                <th>Color / Talle</th>
                                <th>S</th>
                                <th>M</th>
                                <th>L</th>
                                <th>XL</th>
                                <th className={styles.totalCol}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Negro</td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td className={styles.totalCell}>0</td>
                            </tr>
                            <tr>
                                <td>Blanco</td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td><input type="number" defaultValue={0} /></td>
                                <td className={styles.totalCell}>0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button className={styles.btnAction}>
                    <ShoppingCartSimple size={18} />
                    Agregar Curva a Factura
                </button>
            </div>
        );
    }

    if (rubroSlug === 'ferreteria') {
        return (
            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <Percent size={20} weight="bold" />
                    <h3>Actualización por Multiplicador</h3>
                </div>
                <div className={styles.ferreteriaActions}>
                     <div className={styles.inputGroup}>
                        <label>Aumentar Costos (%)</label>
                        <div className={styles.inputWithAddon}>
                            <input 
                                type="number" 
                                value={percentage} 
                                onChange={e => setPercentage(Number(e.target.value))}
                            />
                            <span>%</span>
                        </div>
                     </div>
                     <button 
                        className={styles.btnActionSecondary}
                        onClick={handleUpdateCosts}
                        disabled={isUpdating || !proveedorId}
                     >
                        {isUpdating ? "Aplicando..." : "Aplicar a todo el Proveedor"}
                     </button>
                     
                     <div className={styles.divider} />
                     
                     <div className={styles.subPanel}>
                        <div className={styles.panelHeader}>
                            <ArrowsLeftRight size={18} />
                            <h4>Productos Sustitutos</h4>
                        </div>
                        <p className={styles.smallText}>Buscá alternativas si no hay stock del proveedor actual.</p>
                        <button 
                            className={styles.btnActionOutline}
                            onClick={handleGetSuggestions}
                        >
                            Ver Sugerencias
                        </button>

                        {showSuggestions && (
                            <div className={styles.suggestionsContainer}>
                                <div className={styles.suggestionsHeader}>
                                    <span>Productos sin stock (Alternativas)</span>
                                    <button onClick={() => setShowSuggestions(false)}>×</button>
                                </div>
                                <div className={styles.suggestionsList}>
                                    {suggestions.length === 0 && <p className={styles.noData}>No hay productos críticos sin stock.</p>}
                                    {suggestions.map(p => (
                                        <div key={p.productoId} className={styles.suggestionItem}>
                                            <div className={styles.suggestionMain}>
                                                <span className={styles.suggestionName}>{p.nombre}</span>
                                                <span className={styles.suggestionBadge}>Faltan {p.stockTotal} variantes</span>
                                            </div>
                                            <button 
                                                className={styles.btnQuickAdd}
                                                onClick={() => {
                                                    if (onSelectProduct && p.variantes.length > 0) {
                                                        const v = p.variantes[0];
                                                        onSelectProduct({
                                                            varianteId: v.varianteId,
                                                            nombreCompleto: `${p.nombre} (${v.talle} - ${v.color})`,
                                                            sku: v.sku,
                                                            precioCostoActual: 0 // Se completa en la factura
                                                        });
                                                        setShowSuggestions(false);
                                                    }
                                                }}
                                            >
                                                Seleccionar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        );
    }

    return null;
}
