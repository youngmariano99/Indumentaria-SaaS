import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FloppyDisk, CloudArrowUp, Warning } from "@phosphor-icons/react";
import { Link, useNavigate } from 'react-router-dom';
import styles from './CargaFacturaPage.module.css';
import { RubroMutationPanel } from './components/RubroMutationPanel';
import { catalogApi } from '../catalog/api/catalogApi';
import { providersApi } from './api/providersApi';
import type { ProviderDto } from './api/providersApi';
import { useFeedbackStore } from '../../shared/hooks/useFeedback';
import { Button } from '../../shared/components/Button';
import { useSmartDefaults } from '../../shared/hooks/useSmartDefaults';
import { Disclosure } from '../../shared/components/Disclosure';

interface InvoiceLine {
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
    varianteId?: string;
}

interface ProductMatch {
    varianteId: string;
    nombreCompleto: string;
    sku: string;
    precioCostoActual: number;
}

export function CargaFacturaPage() {
    const navigate = useNavigate();
    const { addToast } = useFeedbackStore();
    const { translateLabel } = useSmartDefaults();
    const [lines, setLines] = useState<InvoiceLine[]>([
        { descripcion: "", cantidad: 1, precio: 0, total: 0 }
    ]);
    const [activeRow, setActiveRow] = useState(0);
    const [activeCol, setActiveCol] = useState(0); // 0: desc, 1: cant, 2: precio
    
    // Datos de cabecera
    const [proveedorId, setProveedorId] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
    const [fechaVencimiento, setFechaVencimiento] = useState(new Date().toISOString().split('T')[0]);

    // Búsqueda y Autocompletado
    const [searchResults, setSearchResults] = useState<ProductMatch[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    
    // Proveedores para el select
    const [proveedores, setProveedores] = useState<ProviderDto[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Preparación para IA
    const [isAiReview] = useState(false);

    const inputsRef = useRef<(HTMLInputElement | null)[][]>([]);

    useEffect(() => {
        // Cargar proveedores
        providersApi.getProviders().then(setProveedores);
    }, []);

    useEffect(() => {
        // Inicializar matriz de refs
        inputsRef.current = lines.map((_, i) => inputsRef.current[i] || []);
    }, [lines]);

    const handleSearch = async (query: string, forced = false) => {
        if (!forced && query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        setLoadingSearch(true);
        try {
            const data = await catalogApi.autocompleteProducts(query);
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error("Error buscando productos", error);
        } finally {
            setLoadingSearch(false);
        }
    };

    const selectProduct = (match: ProductMatch) => {
        const newLines = [...lines];
        newLines[activeRow] = {
            ...newLines[activeRow],
            descripcion: match.nombreCompleto,
            precio: match.precioCostoActual,
            varianteId: match.varianteId,
            total: newLines[activeRow].cantidad * match.precioCostoActual
        };
        setLines(newLines);
        setShowResults(false);
        // Mover el foco a cantidad
        setActiveCol(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
        if ((e.key === ' ' || e.code === 'Space') && e.ctrlKey) {
            e.preventDefault();
            handleSearch(lines[rowIndex].descripcion, true);
            setShowResults(true);
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (showResults && searchResults.length > 0) {
                selectProduct(searchResults[0]);
                return;
            }

            if (rowIndex === lines.length - 1) {
                // Agregar nueva fila si es la última y tiene descripción
                if (lines[rowIndex].descripcion.trim() !== "") {
                    setLines([...lines, { descripcion: "", cantidad: 1, precio: 0, total: 0 }]);
                    setActiveRow(rowIndex + 1);
                    setActiveCol(0);
                }
            } else {
                setActiveRow(rowIndex + 1);
            }
        }
        if (e.key === 'ArrowDown') {
            if (showResults) return; // Permitir que el navegador maneje si hay lista? No, mejor no.
            if (rowIndex < lines.length - 1) setActiveRow(rowIndex + 1);
        }
        if (e.key === 'ArrowUp') {
            if (rowIndex > 0) setActiveRow(rowIndex - 1);
        }
        if (e.key === 'ArrowRight' && colIndex < 2) {
            setActiveCol(colIndex + 1);
        }
        if (e.key === 'ArrowLeft' && colIndex > 0) {
            setActiveCol(colIndex - 1);
        }
        if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const handleSave = async () => {
        if (!proveedorId || !numeroFactura) {
            addToast({ message: "Por favor complete los datos del proveedor y número de factura.", type: 'warning' });
            return;
        }
        const validLines = lines.filter(l => l.descripcion.trim() !== "");
        if (validLines.length === 0) {
            addToast({ message: "Debe agregar al menos una línea a la factura.", type: 'warning' });
            return;
        }

        setIsSaving(true);
        try {
            await providersApi.recordInvoice({
                proveedorId,
                numeroFactura,
                fechaEmision,
                fechaVencimiento,
                lineas: validLines.map(l => ({
                    descripcion: l.descripcion,
                    cantidad: l.cantidad,
                    precioUnitario: l.precio,
                    varianteId: l.varianteId
                }))
            });
            addToast({ message: "Factura registrada con éxito. El stock y saldos han sido actualizados.", type: 'success' });
            navigate("/proveedores");
        } catch (error) {
            console.error("Error al registrar factura", error);
            addToast({ message: "Error al registrar la factura. Verifique la conexión.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const input = inputsRef.current[activeRow]?.[activeCol];
        if (input) input.focus();
    }, [activeRow, activeCol]);

    const updateLine = (idx: number, field: keyof InvoiceLine, value: any) => {
        const newLines = [...lines];
        const line = { ...newLines[idx], [field]: value };
        
        if (field === 'cantidad' || field === 'precio') {
            line.total = line.cantidad * line.precio;
        }
        
        if (field === 'descripcion') {
            handleSearch(value);
        }
        
        newLines[idx] = line;
        setLines(newLines);
    };

    const grandTotal = lines.reduce((acc, l) => acc + l.total, 0);

    return (
        <div className={styles.container}>
             <header className={styles.header}>
                <Link to="/proveedores">
                    <Button variant="ghost" icon={<ArrowLeft size={20} />} />
                </Link>
                <div>
                    <h1 className={styles.title}>Cargar Factura de Proveedor</h1>
                    <p className={styles.subtitle}>Ingreso manual acelerado por teclado.</p>
                </div>
                <div className={styles.headerActions}>
                     <Button 
                        onClick={handleSave} 
                        loading={isSaving}
                        icon={<FloppyDisk size={18} weight="bold" />}
                        educational
                    >
                        {isSaving ? "Guardando..." : "Guardar Factura"}
                    </Button>
                </div>
            </header>

            <div className={styles.layout}>
                <div className={styles.mainPanel}>
                    {/* Sección de Encabezado de Factura */}
                    <div className={styles.invoiceHeaderFields}>
                        <div className={styles.field}>
                            <label>Proveedor</label>
                            <select 
                                className={styles.inputMain}
                                value={proveedorId}
                                onChange={e => setProveedorId(e.target.value)}
                            >
                                <option value="">Seleccione un proveedor...</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.razonSocial} ({p.documento})</option>
                                ))}
                            </select>
                            {proveedorId && proveedores.find(p => p.id === proveedorId)?.porcentajeRecargo !== 0 && (
                                <span className={styles.recargoBadge}>
                                    Recargo: +{proveedores.find(p => p.id === proveedorId)?.porcentajeRecargo}%
                                </span>
                            )}
                        </div>
                        <div className={styles.field}>
                            <label>Nro. Factura</label>
                            <input 
                                type="text" 
                                placeholder="0001-0000..." 
                                className={styles.inputMain} 
                                value={numeroFactura}
                                onChange={e => setNumeroFactura(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Emisión</label>
                            <input 
                                type="date" 
                                className={styles.inputMain} 
                                value={fechaEmision}
                                onChange={e => setFechaEmision(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Vencimiento</label>
                            <input 
                                type="date" 
                                className={styles.inputMain} 
                                value={fechaVencimiento}
                                onChange={e => setFechaVencimiento(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={`${styles.gridContainer} ${isAiReview ? styles.aiReviewMode : ""}`}>
                        {isAiReview && (
                            <div className={styles.aiBanner}>
                                <Warning size={20} weight="fill" />
                                <span>Modo Revisión IA: Verificá los campos resaltados antes de confirmar.</span>
                            </div>
                        )}
                        
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Descripción de {translateLabel('product_singular', 'Producto')} / Servicio</th>
                                        <th style={{ width: 100 }}>Cant.</th>
                                        <th style={{ width: 150 }}>P. Unitario</th>
                                        <th style={{ width: 150 }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, idx) => (
                                        <tr key={idx} className={`${activeRow === idx ? styles.activeRow : ""} ${line.varianteId ? styles.linkedRow : ""}`}>
                                            <td className={styles.descCell}>
                                                <input 
                                                    ref={el => { if(!inputsRef.current[idx]) inputsRef.current[idx] = []; inputsRef.current[idx][0] = el; }}
                                                    type="text" 
                                                    value={line.descripcion}
                                                    onChange={(e) => updateLine(idx, 'descripcion', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                                                    onFocus={() => { setActiveRow(idx); setActiveCol(0); }}
                                                    className={styles.cellInput}
                                                    placeholder="Ctrl+Space para catálogo..."
                                                />
                                                {showResults && activeRow === idx && (
                                                    <div className={styles.resultsMenu}>
                                                        {loadingSearch && <div className={styles.loadingItem}>Buscando en catálogo...</div>}
                                                        {!loadingSearch && searchResults.length === 0 && (
                                                            <div className={styles.loadingItem}>No se encontraron productos.</div>
                                                        )}
                                                        {!loadingSearch && searchResults.map(res => (
                                                            <div 
                                                                key={res.varianteId} 
                                                                className={styles.resultItem}
                                                                onClick={() => selectProduct(res)}
                                                            >
                                                                <div className={styles.resultMain}>
                                                                    <span className={styles.resultName}>{res.nombreCompleto}</span>
                                                                    <span className={styles.resultSku}>{res.sku}</span>
                                                                </div>
                                                                <span className={styles.resultPrice}>Coste: ${res.precioCostoActual.toLocaleString('es-AR')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <input 
                                                    ref={el => { if(!inputsRef.current[idx]) inputsRef.current[idx] = []; inputsRef.current[idx][1] = el; }}
                                                    type="number" 
                                                    value={line.cantidad}
                                                    onChange={(e) => updateLine(idx, 'cantidad', Number(e.target.value))}
                                                    onKeyDown={(e) => handleKeyDown(e, idx, 1)}
                                                    onFocus={() => { setActiveRow(idx); setActiveCol(1); }}
                                                    className={styles.cellInput}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    ref={el => { if(!inputsRef.current[idx]) inputsRef.current[idx] = []; inputsRef.current[idx][2] = el; }}
                                                    type="number" 
                                                    value={line.precio}
                                                    onChange={(e) => updateLine(idx, 'precio', Number(e.target.value))}
                                                    onKeyDown={(e) => handleKeyDown(e, idx, 2)}
                                                    onFocus={() => { setActiveRow(idx); setActiveCol(2); }}
                                                    className={styles.cellInput}
                                                />
                                            </td>
                                            <td className={styles.cellTotal}>
                                                ${line.total.toLocaleString('es-AR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.totalCard}>
                         <div className={styles.totalLabel}>Total Factura</div>
                         <div className={styles.totalValue}>${grandTotal.toLocaleString('es-AR')}</div>
                    </div>

                    <RubroMutationPanel 
                        proveedorId={proveedorId} 
                        currentDescription={lines[activeRow]?.descripcion}
                        onSelectProduct={selectProduct}
                    />

                    <div className={styles.aiDropzone}>
                        <div className={styles.dropzoneTitle}>
                            <CloudArrowUp size={24} />
                            <span>Carga mediante IA</span>
                        </div>
                        <p className={styles.dropzoneText}>
                            Arrastrá la foto o PDF de la factura para que el sistema la lea automáticamente.
                        </p>
                        <div className={styles.dropzoneBadge}>PRÓXIMAMENTE</div>
                    </div>

                    <Disclosure title="Atajos de Teclado" defaultOpen={false}>
                        <div className={styles.shortcuts} style={{ paddingTop: 'var(--space-2)' }}>
                            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                                <li><strong>Enter</strong> - Confirmar línea / Nueva</li>
                                <li><strong>Arrows</strong> - Navegar celdas</li>
                                <li><strong>Ctrl + Space</strong> - Catálogo</li>
                                <li><strong>F10</strong> - Guardar Todo</li>
                            </ul>
                        </div>
                    </Disclosure>
                </aside>
            </div>
        </div>
    );
}
