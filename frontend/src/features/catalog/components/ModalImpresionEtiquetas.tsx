import styles from './ModalImpresionEtiquetas.module.css';
import { Printer, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { printerService } from '../../../lib/printing/PrinterService';
import { usePrinter } from '../../../hooks/usePrinter';
import { Bluetooth, Usb } from '@phosphor-icons/react';

/**
 * Propósito: Generar una vista previa e impresión de etiquetas térmicas para SKUs seleccionados.
 * Lógica: Utiliza CSS @media print para formatear las etiquetas y window.print() para disparar la impresión.
 * Dependencias: React, PhosphorIcons, Button UI.
 */

interface EtiquetaInfo {
    sku: string;
    nombre: string;
    talle: string;
    color: string;
    precio?: number;
}

interface Props {
    etiquetas: EtiquetaInfo[];
    onClose: () => void;
}

export function ModalImpresionEtiquetas({ etiquetas, onClose }: Props) {
    const [formato, setFormato] = useState<'termico' | 'a4' | 'a3'>('termico');
    const [anchoTermico, setAnchoTermico] = useState<number>(40);
    const [copias, setCopias] = useState<number>(1);
    const [protocolo, setProtocolo] = useState<'EscPos' | 'Tspl'>('Tspl');
    const [tipoCodigo, setTipoCodigo] = useState<'both' | 'barcode' | 'qr'>('both');
    const [mostrarPrecio, setMostrarPrecio] = useState<boolean>(false);
    const [modoProducto, setModoProducto] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { status, connectSerial, connectBluetooth, printTicket, printRaw } = usePrinter();

    const handlePrint = async () => {
        if (status.connected) {
            setIsGenerating(true);
            try {
                if (protocolo === 'Tspl') {
                    const buffer = printerService.generateTsplLabel(anchoTermico, 30, etiquetasAImprimir, tipoCodigo, mostrarPrecio, !modoProducto);
                    await printRaw(buffer);
                } else {
                    const lines = etiquetasAImprimir.map(e => `[B]${e.nombre}\nSKU: ${e.sku}\nT: ${e.talle} C: ${e.color}\n---`);
                    await printTicket(lines);
                }
                setIsGenerating(false);
                return;
            } catch (err) {
                console.error(err);
                setIsGenerating(false);
            }
        }
        window.print();
    };

    const getEtiquetaUrl = (sku: string) => {
        return `${window.location.origin}/pos?scan=${sku}`;
    };

    // Definimos dimensiones físicas según estándar milimétrico para lógica de dibujado JS PDF
    const PAGE_W_A4 = 210; const PAGE_H_A4 = 297;
    const PAGE_W_A3 = 297; const PAGE_H_A3 = 420;

    const handleDownloadPDF = async () => {
        const area = document.getElementById('print-area');
        if (!area) return;
        const labels = Array.from(area.children) as HTMLElement[];
        if (labels.length === 0) return;

        setIsGenerating(true);
        // Guardar estado original
        const originalStyle = area.style.cssText;

        try {
            // Forzar render para permitir capturas con escala nativa (fuera de viewport limit)
            area.style.maxHeight = 'none';
            area.style.overflow = 'visible';
            area.style.display = 'block';

            // Propiedades Base
            const isThermal = formato === 'termico';
            const pdfFormatStr = isThermal ? [anchoTermico, anchoTermico * 0.6] : (formato === 'a3' ? 'a3' : 'a4');
            const pageWidth = isThermal ? anchoTermico : (formato === 'a3' ? PAGE_W_A3 : PAGE_W_A4);
            const pageHeight = isThermal ? (anchoTermico * 0.6) : (formato === 'a3' ? PAGE_H_A3 : PAGE_H_A4);

            // Constantes de Grilla (A4 = 3 col, A3 = 2 col grandes)
            const margin = 10; // 10mm de margen de página
            const gap = 5; // 5mm entre etiquetas
            const cols = isThermal ? 1 : (formato === 'a3' ? 2 : 3);

            // Dimensiones físicas de etiqueta (acordadas en CSS)
            const labelW = isThermal ? anchoTermico : (formato === 'a3' ? 105 : 70);
            const labelH = isThermal ? (anchoTermico * 0.6) : (formato === 'a3' ? 37 : 36);

            // Calcular X Inicial (Centrado para cuadricular hoja)
            const totalGridW = (cols * labelW) + ((cols - 1) * gap);
            const startX = isThermal ? 0 : (pageWidth - totalGridW) / 2;
            const startY = isThermal ? 0 : margin;

            let currentX = startX;
            let currentY = startY;
            let currentCol = 0;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: pdfFormatStr,
                hotfixes: ['px_scaling']
            });

            for (let i = 0; i < labels.length; i++) {
                const node = labels[i];

                // Si la etiqueta está por salirse de la página (y no es térmica pura), agregamos hoja
                if (!isThermal && (currentY + labelH > pageHeight - margin)) {
                    pdf.addPage(pdfFormatStr);
                    currentY = startY;
                    currentX = startX;
                    currentCol = 0;
                }

                // Generar imagen de altísima fidelidad individual
                const canvas = await html2canvas(node, {
                    scale: 3, // Mayor escala = mejor QR
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');

                // Si es térmico, agregamos "paño" si no es la primera, construyendo un rollo continuo
                if (isThermal && i > 0) {
                    pdf.addPage([anchoTermico, labelH]);
                }

                // Imprimir
                // Nota: en JS PDF térmico el currentY/X es 0, usamos la top sheet de todo el rato
                pdf.addImage(
                    imgData, 'PNG',
                    isThermal ? 0 : currentX,
                    isThermal ? 0 : currentY,
                    labelW, labelH
                );

                // Calcular posición siguiente
                if (!isThermal) {
                    currentCol++;
                    if (currentCol >= cols) {
                        currentCol = 0;
                        currentX = startX;
                        currentY += labelH + gap; // Salto de Fila
                    } else {
                        currentX += labelW + gap; // Mover a la derecha
                    }
                }
            }

            // Descarga Segura
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: `etiquetas_${new Date().getTime()}.pdf`,
                        types: [{ description: 'Documento PDF', accept: { 'application/pdf': ['.pdf'] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(pdf.output('blob'));
                    await writable.close();
                } catch (err: any) {
                    if (err.name !== 'AbortError') { pdf.save(`etiquetas_${new Date().getTime()}.pdf`); }
                }
            } else {
                pdf.save(`etiquetas_${new Date().getTime()}.pdf`);
            }
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Error al generar el PDF. Revisa los permisos o capacidad de memoria de la pestaña.");
        } finally {
            area.style.cssText = originalStyle;
            setIsGenerating(false);
        }
    };

    // Multiplicar etiquetas en base a la cantidad configurada
    const etiquetasAImprimir = (modoProducto
        ? Object.values(etiquetas.reduce((acc, curr) => {
            if (!acc[curr.nombre]) acc[curr.nombre] = curr;
            return acc;
        }, {} as Record<string, EtiquetaInfo>))
        : etiquetas
    ).flatMap(etiq => Array(copias).fill(etiq));

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Botón de cerrar general esquina flotante */}
                <button onClick={onClose} className={styles.closeCornerBtn}>
                    <X size={24} />
                </button>

                {/* COLUMNA IZQUIERDA: PREVIEW */}
                <div className={styles.previewPane}>
                    <div className={styles.previewScroll}>
                        <div
                            id="print-area"
                            className={
                                formato === 'termico' ? styles.previewContainer :
                                    formato === 'a3' ? styles.previewContainerA3 : styles.previewContainerA4
                            }
                        >
                            {etiquetasAImprimir.map((etique, idx) => (
                                <div key={idx}
                                    className={
                                        formato === 'termico' ? styles.etiquetaIndividual :
                                            formato === 'a3' ? styles.etiquetaA3 : styles.etiquetaA4
                                    }
                                    style={formato === 'termico' ? { width: `${anchoTermico}mm` } : {}}
                                    data-ancho={formato === 'termico' ? anchoTermico : undefined}
                                >
                                    <div className={styles.codesSection}>
                                        {(tipoCodigo === 'both' || tipoCodigo === 'barcode') && (
                                            <div className={styles.barcodeWrap}>
                                                <Barcode
                                                    value={etique.sku}
                                                    width={formato === 'termico' ? (anchoTermico < 50 ? 1 : (anchoTermico > 80 ? 2 : 1.2)) : 1.5}
                                                    height={formato === 'termico' ? (anchoTermico < 50 ? 25 : 30) : 40}
                                                    fontSize={10}
                                                    margin={0}
                                                />
                                            </div>
                                        )}
                                        {(tipoCodigo === 'both' || tipoCodigo === 'qr') && (
                                            <div className={styles.qrWrap}>
                                                <QRCodeCanvas value={getEtiquetaUrl(etique.sku)} size={formato === 'termico' ? (anchoTermico < 50 ? 25 : 35) : 50} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.textSection}>
                                        <span className={styles.labelNombre} style={formato === 'termico' && anchoTermico < 50 ? { fontSize: '0.6rem' } : {}}>
                                            {etique.nombre}
                                        </span>
                                        {!modoProducto && (
                                            <div className={styles.labelSpecs}>
                                                <span>T: {etique.talle}</span>
                                                <span>C: {etique.color}</span>
                                                {mostrarPrecio && etique.precio && <span className={styles.labelPrecio}>${etique.precio.toLocaleString()}</span>}
                                            </div>
                                        )}
                                        {modoProducto && mostrarPrecio && etique.precio && (
                                            <div className={styles.labelSpecs}>
                                                <span className={styles.labelPrecio}>${etique.precio.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: PANELES POS */}
                <div className={styles.controlPane}>
                    <h2>Opciones de Impresión</h2>

                    <div className={styles.sectionGroup}>
                        <span className={styles.sectionLabel}>Formato de Salida</span>
                        <div className={styles.tabsContainer}>
                            <button
                                className={`${styles.tabBtn} ${formato === 'termico' ? styles.tabBtnActive : ''}`}
                                onClick={() => setFormato('termico')}
                            >
                                Térmica (Directa)
                            </button>
                            <button
                                className={`${styles.tabBtn} ${formato === 'a4' ? styles.tabBtnActive : ''}`}
                                onClick={() => setFormato('a4')}
                            >
                                Hoja A4 (Grilla)
                            </button>
                            {/* Oculto A3 por defecto temporalmente, lo unifico en A4 para no llenar la UI si no se necesita. Sino, lo agrego si el usuario prefiere */}
                        </div>

                        {formato === 'termico' && (
                            <select
                                className={styles.settingSelect}
                                value={anchoTermico}
                                onChange={(e) => setAnchoTermico(Number(e.target.value))}
                            >
                                <option value="40">Térmico (40mm x 30mm)</option>
                                <option value="58">Térmico (58mm)</option>
                                <option value="80">Térmico (80mm)</option>
                            </select>
                        )}
                    </div>

                    <div className={styles.sectionGroup}>
                        <label className={styles.sectionLabel}>Contenido del Código</label>
                        <select
                            className={styles.settingSelect}
                            value={tipoCodigo}
                            onChange={(e) => setTipoCodigo(e.target.value as 'both' | 'barcode' | 'qr')}
                        >
                            <option value="both">Barras + QR</option>
                            <option value="barcode">Solo Código de Barras</option>
                            <option value="qr">Solo QR</option>
                        </select>
                    </div>

                    <div className={styles.sectionGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            id="toggle-precio"
                            checked={mostrarPrecio}
                            onChange={(e) => setMostrarPrecio(e.target.checked)}
                        />
                        <label htmlFor="toggle-precio" className={styles.sectionLabel} style={{ marginBottom: 0 }}>Incluir Precio de Venta</label>
                    </div>

                    <div className={styles.sectionGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            id="toggle-producto"
                            checked={modoProducto}
                            onChange={(e) => setModoProducto(e.target.checked)}
                        />
                        <label htmlFor="toggle-producto" className={styles.sectionLabel} style={{ marginBottom: 0 }}>Modo Producto (Sin Variantes)</label>
                    </div>

                    <div className={styles.sectionGroup}>
                        <label className={styles.sectionLabel}>Protocolo de Impresión</label>
                        <select
                            className={styles.settingSelect}
                            value={protocolo}
                            onChange={(e) => setProtocolo(e.target.value as 'EscPos' | 'Tspl')}
                        >
                            <option value="Tspl">Efecto Etiqueta (TSPL - Recomendado)</option>
                            <option value="EscPos">Modo Ticketera (ESC/POS)</option>
                        </select>
                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.4rem' }}>
                            TSPL es necesario para que la impresora detecte el corte entre etiquetas.
                        </p>
                    </div>

                    <div className={styles.sectionGroup}>
                        <span className={styles.sectionLabel}>Copias por Variante</span>
                        <div className={styles.quantityControl}>
                            <button className={styles.qtyBtn} onClick={() => setCopias(c => Math.max(1, c - 1))}>-</button>
                            <input type="number" className={styles.qtyInput} value={copias} readOnly />
                            <button className={styles.qtyBtn} onClick={() => setCopias(c => Math.min(100, c + 1))}>+</button>
                        </div>
                    </div>

                    <div className={styles.posActions}>
                        {!status.connected ? (
                            <div className={styles.connectionOptions}>
                                <button className={styles.connBtn} onClick={connectSerial}>
                                    <Usb size={18} /> USB (Serial)
                                </button>
                                <button className={styles.connBtn} onClick={connectBluetooth}>
                                    <Bluetooth size={18} /> Bluetooth
                                </button>
                            </div>
                        ) : (
                            <div className={styles.connectedBadge}>
                                🟢 Conectado vía {status.interface}
                            </div>
                        )}

                        <button className={styles.posBtnPrimary} onClick={handlePrint}>
                            <Printer size={20} weight="bold" />
                            {status.connected ? 'Imprimir Directo' : 'Imprimir Etiquetas'}
                        </button>

                        <button
                            className={styles.posBtnSecondary}
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generando...' : 'Descargar PDF Variante'}
                        </button>
                    </div>
                </div>
            </div>

            {/* INYECCIÓN DINÁMICA DE TAMAÑO DE PÁGINA PARA IMPRESORAS TÉRMICAS */}
            {formato === 'termico' && (
                <style>
                    {`
                    @media print {
                        @page {
                            size: ${anchoTermico}mm auto !important;
                            margin: 0 !important;
                        }
                    }
                    `}
                </style>
            )}
        </div>
    );
}
