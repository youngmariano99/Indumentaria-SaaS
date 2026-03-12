import { useState, useEffect, type KeyboardEvent } from "react";
import { Palette, X, Rows, PlusCircle, ArrowsInLineHorizontal, ArrowsInLineVertical, Trash } from "@phosphor-icons/react";
import type { FilaVariante } from "../../../features/catalog/types";
import type { FieldDefinition } from "../../../components/common";
import styles from "../../../features/catalog/NuevoProductoPage.module.css";

interface VariantesGridProps {
    inheritedSchema?: FieldDefinition[];
    talles: string[];
    colores: string[];
    inputTalle: string;
    inputColor: string;
    loading: boolean;
    filas: FilaVariante[];
    seleccionadas: Set<number>;
    bulkPrecio: string;
    bulkCosto: string;
    bulkStock: string;
    bulkAtributoClave: string;
    bulkAtributoValor: string;
    
    setTalles: React.Dispatch<React.SetStateAction<string[]>>;
    setColores: React.Dispatch<React.SetStateAction<string[]>>;
    setInputTalle: (v: string) => void;
    setInputColor: (v: string) => void;
    agregarTalle: () => void;
    agregarColor: () => void;
    onKeyTalle: (e: KeyboardEvent<HTMLInputElement>) => void;
    onKeyColor: (e: KeyboardEvent<HTMLInputElement>) => void;
    setSeleccionadas: React.Dispatch<React.SetStateAction<Set<number>>>;
    toggleTodas: () => void;
    toggleFila: (idx: number) => void;
    eliminarFila: (idx: number) => void;
    editarFila: (idx: number, campo: keyof FilaVariante, valor: string) => void;
    setModalFilaIdx: (idx: number | null) => void;
    setBulkPrecio: (v: string) => void;
    setBulkCosto: (v: string) => void;
    setBulkStock: (v: string) => void;
    setBulkAtributoClave: (v: string) => void;
    setBulkAtributoValor: (v: string) => void;
    aplicarASeleccionadas: () => void;
}

export default function VariantesGridFerreteria(props: VariantesGridProps) {
    const {
        inheritedSchema = [],
        talles, colores, inputTalle, inputColor, loading, filas, seleccionadas,
        bulkPrecio, bulkCosto, bulkStock,
        setTalles, setColores, setInputTalle, setInputColor, agregarTalle, agregarColor,
        onKeyTalle, onKeyColor, setSeleccionadas, toggleTodas, toggleFila, eliminarFila,
        editarFila, setBulkPrecio, setBulkCosto, setBulkStock,
        aplicarASeleccionadas
    } = props;

    // Estados para los ejes (FERRETERIA)
    const [ejeX, setEjeX] = useState<string>("Medida");
    const [ejeY, setEjeY] = useState<string>("Material");

    // Sincronizar ejes con el esquema si está disponible
    useEffect(() => {
        if (inheritedSchema.length >= 2) {
            setEjeX(inheritedSchema[0].label);
            setEjeY(inheritedSchema[1].label);
        } else if (inheritedSchema.length === 1) {
            setEjeX(inheritedSchema[0].label);
            setEjeY("Opción");
        }
    }, [inheritedSchema]);

    // Navegación por teclado estilo Excel
    const handleTableKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const inputs = Array.from(document.querySelectorAll(`.${styles.table} input`)) as HTMLInputElement[];
        const currentIndex = inputs.indexOf(e.currentTarget);
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            // Buscar el input en la misma columna pero siguiente fila
            // En nuestra tabla hay 4 campos editables: SKU, Costo, Precio, Stock
            const nextIdx = currentIndex + 4;
            if (nextIdx < inputs.length) inputs[nextIdx].focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIdx = currentIndex - 4;
            if (prevIdx >= 0) inputs[prevIdx].focus();
        } else if (e.key === "ArrowRight" && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
            // Solo saltar si el cursor está al final
            const nextIdx = currentIndex + 1;
            if (nextIdx < inputs.length) inputs[nextIdx].focus();
        } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
            const prevIdx = currentIndex - 1;
            if (prevIdx >= 0) inputs[prevIdx].focus();
        }
    };

    return (
        <>
            <div className={styles.card} style={{ marginTop: "var(--space-6)", borderTop: "4px solid #f59e0b" }}>
                <h2 className={styles.cardTitle}>
                    <Palette size={20} weight="bold" color="#f59e0b" />
                    Generador Combinatorio Técnico (Ferretería)
                </h2>
                <p className={styles.fieldHelp} style={{ marginBottom: "var(--space-4)" }}>
                    Elegí dos dimensiones para cruzar. El sistema generará todas las combinaciones posibles.
                </p>

                <div className={styles.grid2} style={{ marginBottom: "var(--space-4)" }}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}><ArrowsInLineHorizontal size={14} /> Eje X (Columnas)</label>
                        <select 
                            className={styles.input} 
                            value={ejeX} 
                            onChange={e => setEjeX(e.target.value)}
                        >
                            <option value="Opción">Genérico</option>
                            {inheritedSchema.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}><ArrowsInLineVertical size={14} /> Eje Y (Filas)</label>
                        <select 
                            className={styles.input} 
                            value={ejeY} 
                            onChange={e => setEjeY(e.target.value)}
                        >
                            <option value="Opción">Genérico</option>
                            {inheritedSchema.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.grid2}>
                    {/* Chips de Eje X */}
                    <div className={styles.chipsSection}>
                        <label className={styles.label}>{ejeX} <span className={styles.required}>*</span></label>
                        <div className={styles.chipsWrap} onClick={() => document.getElementById("inputTalle")?.focus()}>
                            {talles.map(t => (
                                <span key={t} className={styles.chip} style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                                    {t}
                                    <button
                                        type="button"
                                        className={styles.chipRemove}
                                        onClick={() => setTalles(prev => prev.filter(x => x !== t))}
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
                                placeholder={`Valores de ${ejeX}...`}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Chips de Eje Y */}
                    <div className={styles.chipsSection}>
                        <label className={styles.label}>{ejeY} <span className={styles.required}>*</span></label>
                        <div className={styles.chipsWrap} onClick={() => document.getElementById("inputColor")?.focus()}>
                            {colores.map(c => (
                                <span key={c} className={styles.chip} style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                                    {c}
                                    <button
                                        type="button"
                                        className={styles.chipRemove}
                                        onClick={() => setColores(prev => prev.filter(x => x !== c))}
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
                                placeholder={`Valores de ${ejeY}...`}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                <div className={styles.matrixHeader}>
                    <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                        <Rows size={20} weight="bold" />
                        Matriz Técnica ({ejeX} × {ejeY})
                    </h2>
                    {filas.length > 0 && (
                        <span className={styles.matrixCount}>
                            {filas.length} variante{filas.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {seleccionadas.size > 0 && (
                    <div className={styles.bulkBar}>
                        <div className={styles.bulkHeader}>
                            <span className={styles.bulkLabel}>Acción masiva ({seleccionadas.size} seleccionadas)</span>
                            <button type="button" className={styles.bulkCancelBtn} onClick={() => setSeleccionadas(new Set())}>Deseleccionar</button>
                        </div>
                        <div className={styles.bulkSection}>
                            <div className={styles.bulkGroup}>
                                <div className={styles.bulkFields}>
                                    <input className={styles.tableInput} type="number" placeholder="Precio $" value={bulkPrecio} onChange={e => setBulkPrecio(e.target.value)} />
                                    <input className={styles.tableInput} type="number" placeholder="Costo $" value={bulkCosto} onChange={e => setBulkCosto(e.target.value)} />
                                    <input className={styles.tableInput} type="number" placeholder="Stock" value={bulkStock} onChange={e => setBulkStock(e.target.value)} />
                                    <button type="button" className={styles.bulkApplyBtn} onClick={aplicarASeleccionadas} disabled={!bulkPrecio && !bulkCosto && !bulkStock}>Aplicar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {filas.length === 0 ? (
                    <div className={styles.emptyMatrix}>
                        <PlusCircle size={48} weight="thin" />
                        <p>Ingresá los valores técnicos arriba para generar la tabla de variantes.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 32 }}><input type="checkbox" checked={seleccionadas.size === filas.length} onChange={toggleTodas} /></th>
                                    <th>{ejeX}</th>
                                    <th>{ejeY}</th>
                                    <th>SKU</th>
                                    <th>Costo $</th>
                                    <th>Precio $</th>
                                    <th>Stock</th>
                                    <th style={{ width: 32 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((fila, idx) => (
                                    <tr key={idx} className={`${styles.tableRow} ${seleccionadas.has(idx) ? styles.tableRowSelected : ""}`} onClick={() => toggleFila(idx)}>
                                        <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={seleccionadas.has(idx)} onChange={() => toggleFila(idx)} /></td>
                                        <td><strong>{fila.talle}</strong></td>
                                        <td><strong>{fila.color}</strong></td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <input 
                                                className={styles.tableInput} 
                                                value={fila.sku} 
                                                onChange={e => editarFila(idx, "sku", e.target.value)}
                                                onKeyDown={e => handleTableKeyDown(e)}
                                            />
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <input 
                                                className={styles.tableInput} 
                                                type="number" 
                                                value={fila.precioCosto} 
                                                onChange={e => editarFila(idx, "precioCosto", e.target.value)}
                                                onKeyDown={e => handleTableKeyDown(e)}
                                            />
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <input 
                                                className={styles.tableInput} 
                                                type="number" 
                                                value={fila.precioOverride} 
                                                onChange={e => editarFila(idx, "precioOverride", e.target.value)}
                                                onKeyDown={e => handleTableKeyDown(e)}
                                            />
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <input 
                                                className={styles.tableInput} 
                                                type="number" 
                                                value={fila.stockInicial} 
                                                onChange={e => editarFila(idx, "stockInicial", e.target.value)}
                                                onKeyDown={e => handleTableKeyDown(e)}
                                            />
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button type="button" className={styles.deleteRowBtn} onClick={() => eliminarFila(idx)}><Trash size={13} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
