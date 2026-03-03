import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from '@phosphor-icons/react';
import styles from './CameraScanner.module.css';

interface Props {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: Props) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Crear instancia del scanner
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                onScan(decodedText);
                onClose(); // Cerrar tras escaneo exitoso
            },
            () => {
                // Errores de escaneo (normalmente safe to ignore)
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [onScan, onClose]);

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h3>Escanear Código</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </header>
                <div id="reader" className={styles.reader}></div>
                <div className={styles.footer}>
                    <p>Apunte la cámara al código QR o de barras de la etiqueta.</p>
                </div>
            </div>
        </div>
    );
}
