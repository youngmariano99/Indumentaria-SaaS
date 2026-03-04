import { useEffect, useRef, useState, useCallback } from 'react';
import { X, WarningCircle } from '@phosphor-icons/react';
import styles from './CameraScanner.module.css';

interface CameraScannerProps {
    onOpen: boolean;
    onClose: () => void;
    onDetection: (barcode: string) => void;
}

export function CameraScanner({ onOpen, onClose, onDetection }: CameraScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const initCamera = useCallback(async () => {
        if (!onOpen) return;
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsDetecting(true);
        } catch (err: any) {
            console.error("No se pudo acceder a la camara", err);
            setError("No se pudo iniciar la cámara. Verificá los permisos.");
        }
    }, [onOpen]);

    const stopCamera = useCallback(() => {
        setIsDetecting(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (onOpen) {
            initCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [onOpen, initCamera, stopCamera]);

    // Loop de detección usando BarcodeDetector API de HTML5 moderno
    useEffect(() => {
        if (!isDetecting || !videoRef.current || !onOpen) return;

        // Polishing API check for Safari
        if (!('BarcodeDetector' in window)) {
            setError("Tu navegador actual no soporta la detección nativa de código de barras por hardware. Actualizá Chrome o Edge.");
            return;
        }

        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128'] });
        let detectionInterval: number;

        const scanFrame = async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    const detectedValue = barcodes[0].rawValue;
                    if (detectedValue) {
                        onDetection(detectedValue);
                        // Breve pausa para no scanear 50 veces el mismo código por segundo
                        setIsDetecting(false);
                        setTimeout(() => setIsDetecting(true), 1500);
                    }
                }
            } catch (err) {
                console.error("Error en detección de frame:", err);
            }
        };

        detectionInterval = window.setInterval(scanFrame, 200); // 5 frames per second is polite and highly performant
        return () => clearInterval(detectionInterval);
    }, [isDetecting, onOpen, onDetection]);

    if (!onOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.scannerModal}>
                <div className={styles.header}>
                    <h4>Escanear Código</h4>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.cameraFrame}>
                    {error ? (
                        <div className={styles.errorMessage}>
                            <WarningCircle size={32} />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={styles.videoStream}
                            />
                            <div className={styles.gridOverlay}>
                                {/* Línea láser animada por CSS */}
                                <div className={styles.laser}></div>
                            </div>
                        </>
                    )}
                </div>
                {!error && <div className={styles.instructions}>Apuntá la cámara trasera hacia el código de barras o QR de la prenda.</div>}
            </div>
        </div>
    );
}
