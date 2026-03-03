import styles from './ModalImpresionEtiquetas.module.css';
import { Button } from '../../../components/ui/Button';
import { Printer, X, QrCode } from '@phosphor-icons/react';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';

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
    const [formato, setFormato] = useState<'termico' | 'a4'>('termico');

    const handlePrint = () => {
        window.print();
    };

    const getEtiquetaUrl = (sku: string) => {
        // En producción sería la URL real del producto o un endpoint de consulta rápida
        return `${window.location.origin}/pos?scan=${sku}`;
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
                            </select>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                            <QrCode size={18} /> QR + Barras Incluidos
                        </div>
                    </div>

                    <div id="print-area" className={formato === 'termico' ? styles.previewContainer : styles.previewContainerA4}>
                        {etiquetas.map((etique, idx) => (
                            <div key={idx} className={formato === 'termico' ? styles.etiquetaIndividual : styles.etiquetaA4}>
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
                    <Button onClick={handlePrint} className={styles.printBtn}>
                        <Printer size={20} weight="bold" />
                        Imprimir Ahora
                    </Button>
                </footer>
            </div>
        </div>
    );
}
