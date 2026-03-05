import styles from './ModalImpresionEtiquetas.module.css';
import { Button } from '../../../components/ui/Button';
import { Printer, X, QrCode } from '@phosphor-icons/react';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
    // Anchos comerciales estándar (mm) para el formato térmico
    const [anchoTermico, setAnchoTermico] = useState<number>(58);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = () => {
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

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <header className={styles.header}>
                    <h3>Impresión de Etiquetas</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </header>

                <div className={styles.content}>
                    <div className={styles.optionsBar}>
                        <div className={styles.optionField}>
                            <label>Formato de Impresión</label>
                            <select value={formato} onChange={(e) => setFormato(e.target.value as any)}>
                                <option value="termico">Rollo Térmico Continuo</option>
                                <option value="a4">Hojas A4 (Grilla)</option>
                                <option value="a3">Hojas A3 (Grilla)</option>
                            </select>
                        </div>
                        {formato === 'termico' && (
                            <div className={styles.optionField}>
                                <label>Rollo (Ancho)</label>
                                <select value={anchoTermico} onChange={(e) => setAnchoTermico(Number(e.target.value))}>
                                    <option value={38}>38 mm (Códigos QR Pequeños)</option>
                                    <option value={50}>50 mm (Etiquetadora Estándar)</option>
                                    <option value={58}>58 mm (Ticketera Común 58mm)</option>
                                    <option value={80}>80 mm (Ticketera Retail 80mm)</option>
                                    <option value={100}>100 mm (Etiquetas Especiales)</option>
                                    <option value={112}>112 mm (Logística/Envíos)</option>
                                    <option value={216}>216 mm (Industrial)</option>
                                </select>
                            </div>
                        )}
                        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem', color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Printer size={16} /> <i>Soporta Kiosk Mode</i>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <QrCode size={16} /> QR + Barras Estandarizadas
                            </span>
                        </div>
                    </div>

                    <div
                        id="print-area"
                        className={
                            formato === 'termico' ? styles.previewContainer :
                                formato === 'a3' ? styles.previewContainerA3 : styles.previewContainerA4
                        }
                    >
                        {etiquetas.map((etique, idx) => (
                            <div key={idx}
                                className={
                                    formato === 'termico' ? styles.etiquetaIndividual :
                                        formato === 'a3' ? styles.etiquetaA3 : styles.etiquetaA4
                                }
                                style={formato === 'termico' ? { width: `${anchoTermico}mm` } : {}}
                            >
                                <div className={styles.codesSection}>
                                    <div className={styles.barcodeWrap}>
                                        <Barcode
                                            value={etique.sku}
                                            width={formato === 'termico' ? (anchoTermico < 50 ? 1 : (anchoTermico > 80 ? 2 : 1.2)) : 1.5}
                                            height={formato === 'termico' ? (anchoTermico < 50 ? 25 : 30) : 40}
                                            fontSize={10}
                                            margin={0}
                                        />
                                    </div>
                                    <div className={styles.qrWrap}>
                                        <QRCodeCanvas value={getEtiquetaUrl(etique.sku)} size={formato === 'termico' ? (anchoTermico < 50 ? 25 : 35) : 50} />
                                    </div>
                                </div>
                                <div className={styles.textSection}>
                                    <span className={styles.labelNombre} style={formato === 'termico' && anchoTermico < 50 ? { fontSize: '0.6rem' } : {}}>{etique.nombre}</span>
                                    <div className={styles.labelSpecs}>
                                        <span>T: {etique.talle}</span>
                                        <span>C: {etique.color}</span>
                                        {etique.precio && <span className={styles.labelPrecio}>${etique.precio.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className={styles.footer}>
                    <Button variant="secundario" onClick={onClose}>Cancelar</Button>
                    <Button
                        variant="secundario"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        iconLeft={<QrCode size={20} />}
                    >
                        {isGenerating ? 'Generando...' : 'Descargar PDF'}
                    </Button>
                    <Button onClick={handlePrint} className={styles.printBtn}>
                        <Printer size={20} weight="bold" />
                        Imprimir
                    </Button>
                </footer>
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
