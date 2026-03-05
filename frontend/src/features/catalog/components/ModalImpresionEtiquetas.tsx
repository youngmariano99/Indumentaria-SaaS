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
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const getEtiquetaUrl = (sku: string) => {
        return `${window.location.origin}/pos?scan=${sku}`;
    };

    const handleDownloadPDF = async () => {
        const area = document.getElementById('print-area');
        if (!area) return;

        setIsGenerating(true);
        // Guardamos estilos originales para restaurar después
        const originalStyle = area.style.cssText;

        try {
            // Forzamos que se muestre todo para la captura
            area.style.maxHeight = 'none';
            area.style.overflow = 'visible';
            area.style.display = 'block';

            const canvas = await html2canvas(area, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfFormat = formato === 'termico' ? [50, 30] : (formato === 'a3' ? 'a3' : 'a4');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: pdfFormat
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculamos cuánta "altura de imagen" entra en una página física de PDF
            const imgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeightInPdf;
            let position = 0;

            // Primera página
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            // Páginas adicionales si sobran etiquetas
            while (heightLeft > 0) {
                position = heightLeft - imgHeightInPdf;
                pdf.addPage(pdfFormat);
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }

            // API de File System Access nativa (Desktop Chrome/Edge/Opera moderno)
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: `etiquetas_${new Date().getTime()}.pdf`,
                        types: [{
                            description: 'Documento PDF',
                            accept: { 'application/pdf': ['.pdf'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    // jsPDF.output('blob') returns exactly the PDF binary sequence
                    await writable.write(pdf.output('blob'));
                    await writable.close();
                } catch (err: any) {
                    if (err.name !== 'AbortError') {
                        console.error('File System Access API failed', err);
                        pdf.save(`etiquetas_${new Date().getTime()}.pdf`);
                    }
                }
            } else {
                // Caída elegante para Safari/iOS o navegadores que no soportan la API
                pdf.save(`etiquetas_${new Date().getTime()}.pdf`);
            }

        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Error al generar el PDF. Probá usando la opción Imprimir.");
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
                                <option value="termico">Ticketera Térmica (50x30mm)</option>
                                <option value="a4">Hoja A4 (Grilla)</option>
                                <option value="a3">Hoja A3 (Grilla)</option>
                            </select>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                            <QrCode size={18} /> QR + Barras Incluidos
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
                            <div key={idx} className={
                                formato === 'termico' ? styles.etiquetaIndividual :
                                    formato === 'a3' ? styles.etiquetaA3 : styles.etiquetaA4
                            }>
                                <div className={styles.codesSection}>
                                    <div className={styles.barcodeWrap}>
                                        <Barcode
                                            value={etique.sku}
                                            width={formato === 'termico' ? 1.2 : 1.5}
                                            height={formato === 'termico' ? 30 : 40}
                                            fontSize={10}
                                            margin={0}
                                        />
                                    </div>
                                    <div className={styles.qrWrap}>
                                        <QRCodeCanvas value={getEtiquetaUrl(etique.sku)} size={formato === 'termico' ? 35 : 50} />
                                    </div>
                                </div>
                                <div className={styles.textSection}>
                                    <span className={styles.labelNombre}>{etique.nombre}</span>
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
        </div>
    );
}
