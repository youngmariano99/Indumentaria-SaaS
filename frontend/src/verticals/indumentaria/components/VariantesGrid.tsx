import { type KeyboardEvent } from "react";
import { Palette, X, Rows, PlusCircle, CheckCircle, Plus, Trash, Tag } from "@phosphor-icons/react";
import { useSmartDefaults } from "../../../shared/hooks/useSmartDefaults";
import { Button } from "../../../shared/components/Button";
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
    aplicarAtributoMasivo: () => void;
}

export default function VariantesGridIndumentaria(props: VariantesGridProps) {
    const {
        talles, colores, inputTalle, inputColor, loading, filas, seleccionadas,
        bulkPrecio, bulkCosto, bulkStock, bulkAtributoClave, bulkAtributoValor,
        setTalles, setColores, setInputTalle, setInputColor, agregarTalle, agregarColor,
        onKeyTalle, onKeyColor, setSeleccionadas, toggleTodas, toggleFila, eliminarFila,
        editarFila, setModalFilaIdx, setBulkPrecio, setBulkCosto, setBulkStock,
        setBulkAtributoClave, setBulkAtributoValor, aplicarASeleccionadas, aplicarAtributoMasivo
    } = props;
    const { translateLabel } = useSmartDefaults();

    return (
        <>
            <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                <h2 className={styles.cardTitle}>
                    <Palette size={20} weight="bold" />
                    Generador de Variantes ({translateLabel('variant', 'Talle')} × {translateLabel('variant_color', 'Color')})
                </h2>

                <div className={styles.grid2}>
                    {/* Chips de talles */}
                    <div className={styles.chipsSection}>
                        <label className={styles.label}>{translateLabel('variant', 'Talles')} <span className={styles.required}>*</span></label>
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
                                placeholder={`Agregar ${translateLabel('variant', 'talle')}...`}
                                disabled={loading}
                            />
                        </div>
                        <span className={styles.chipHint}>Pre-cargados según tipo · Podés editar libremente · Enter para agregar</span>
                    </div>

                    {/* Chips de colores */}
                    <div className={styles.chipsSection}>
                        <label className={styles.label}>{translateLabel('variant_color', 'Colores')} <span className={styles.required}>*</span></label>
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
                                placeholder={`Agregar ${translateLabel('variant_color', 'color')}...`}
                                disabled={loading}
                            />
                        </div>
                        <span className={styles.chipHint}>Escribí un color y presioná Enter</span>
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
                <div className={styles.matrixHeader}>
                    <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                        <Rows size={20} weight="bold" />
                        Matriz de Variantes
                    </h2>
                    {filas.length > 0 && (
                        <span className={styles.matrixCount}>
                            {filas.length} variante{filas.length !== 1 ? "s" : ""}
                            {seleccionadas.size > 0 && (
                                <span style={{ marginLeft: 6, color: "var(--color-primary)", fontWeight: 700 }}>
                                    · {seleccionadas.size} seleccionada{seleccionadas.size !== 1 ? "s" : ""}
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {seleccionadas.size > 0 && (
                    <div className={styles.bulkBar}>
                        <div className={styles.bulkHeader}>
                            <span className={styles.bulkLabel}>Acción masiva ({seleccionadas.size} variantes seleccionadas)</span>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSeleccionadas(new Set())}
                            >
                                Deseleccionar
                            </Button>
                        </div>
                        <div className={styles.bulkSection}>
                            <div className={styles.bulkGroup}>
                                <div className={styles.bulkGroupTitle}>
                                    <Tag size={12} weight="bold" /> Valores Generales
                                </div>
                                <div className={styles.bulkFields}>
                                    <div className={styles.bulkField}>
                                        <span className={styles.bulkFieldLabel}>Precio $</span>
                                        <input
                                            className={styles.tableInput}
                                            type="number"
                                            placeholder="ej: 15000"
                                            value={bulkPrecio}
                                            onChange={e => setBulkPrecio(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.bulkField}>
                                        <span className={styles.bulkFieldLabel}>Costo $</span>
                                        <input
                                            className={styles.tableInput}
                                            type="number"
                                            placeholder="ej: 12000"
                                            value={bulkCosto}
                                            onChange={e => setBulkCosto(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.bulkField}>
                                        <span className={styles.bulkFieldLabel}>Stock</span>
                                        <input
                                            className={styles.tableInput}
                                            type="number"
                                            placeholder="ej: 20"
                                            value={bulkStock}
                                            onChange={e => setBulkStock(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={aplicarASeleccionadas}
                                        disabled={!bulkPrecio && !bulkCosto && !bulkStock}
                                        icon={<CheckCircle size={14} weight="bold" />}
                                        educational
                                    >
                                        Aplicar Valores
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.bulkDivider}></div>
                            <div className={styles.bulkGroup}>
                                <div className={styles.bulkGroupTitle}>
                                    <Plus size={12} weight="bold" /> Detalles Específicos
                                </div>
                                <div className={styles.bulkFields}>
                                    <div className={styles.bulkField}>
                                        <span className={styles.bulkFieldLabel}>Clave</span>
                                        <input
                                            className={styles.tableInput}
                                            placeholder="ej: Estampa"
                                            value={bulkAtributoClave}
                                            onChange={e => setBulkAtributoClave(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.bulkField}>
                                        <span className={styles.bulkFieldLabel}>Valor</span>
                                        <input
                                            className={styles.tableInput}
                                            placeholder="ej: Dragon"
                                            value={bulkAtributoValor}
                                            onChange={e => setBulkAtributoValor(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={aplicarAtributoMasivo}
                                        disabled={!bulkAtributoClave.trim()}
                                        icon={<Plus size={14} weight="bold" />}
                                        educational
                                    >
                                        Asignar Detalle
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {filas.length === 0 ? (
                    <div className={styles.emptyMatrix}>
                        <PlusCircle size={48} weight="thin" className={styles.emptyMatrixIcon} />
                        <p className={styles.emptyMatrixText}>
                            Seleccioná el tipo de ropa para pre-cargar los talles e ingresá los colores.
                        </p>
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 100 }}>Detalles</th>
                                    <th style={{ width: 32, textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={seleccionadas.size === filas.length && filas.length > 0}
                                            onChange={toggleTodas}
                                            style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                                        />
                                    </th>
                                    <th style={{ width: 32 }}></th>
                                    <th>{translateLabel('variant', 'Talle')}</th>
                                    <th>{translateLabel('variant_color', 'Color')}</th>
                                    <th>SKU (opcional)</th>
                                    <th>Costo $</th>
                                    <th>Precio especial $</th>
                                    <th>Stock inicial</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((fila, idx) => (
                                    <tr
                                        key={`${fila.talle}-${fila.color}-${idx}`}
                                        className={`${styles.tableRow} ${seleccionadas.has(idx) ? styles.tableRowSelected : ""}`}
                                        onClick={() => toggleFila(idx)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td onClick={e => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => setModalFilaIdx(idx)}
                                                className={styles.detailsBtn}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    backgroundColor: Object.keys(fila.atributos || {}).length > 0 ? '#eff6ff' : '#f3f4f6',
                                                    color: Object.keys(fila.atributos || {}).length > 0 ? '#2563eb' : '#6b7280',
                                                    border: '1px solid',
                                                    borderColor: Object.keys(fila.atributos || {}).length > 0 ? '#bfdbfe' : '#d1d5db',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <PlusCircle size={12} />
                                                {Object.keys(fila.atributos || {}).length > 0 ? `${Object.keys(fila.atributos || {}).length} detalles` : "Añadir"}
                                            </button>
                                        </td>
                                        <td onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
                                            <input
                                                type="checkbox"
                                                checked={seleccionadas.has(idx)}
                                                onChange={() => toggleFila(idx)}
                                                style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                                            />
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button type="button" className={styles.deleteRowBtn} onClick={() => eliminarFila(idx)}>
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
                                                value={fila.precioCosto}
                                                onChange={e => editarFila(idx, "precioCosto", e.target.value)}
                                                disabled={loading}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={styles.tableInput}
                                                type="number"
                                                value={fila.precioOverride}
                                                onChange={e => editarFila(idx, "precioOverride", e.target.value)}
                                                disabled={loading}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={styles.tableInput}
                                                type="number"
                                                value={fila.stockInicial}
                                                onChange={e => editarFila(idx, "stockInicial", e.target.value)}
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
        </>
    );
}
