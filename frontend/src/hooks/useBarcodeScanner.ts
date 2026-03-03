import { useEffect, useRef } from 'react';

/**
 * Propósito: Detectar entradas rápidas de teclado compatibles con pistolas de códigos de barras (HID).
 * Lógica: Acumula caracteres y dispara un callback si la velocidad de tipeo es alta (< 50ms entre teclas).
 * Dependencias: React (useEffect, useRef).
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const barcode = useRef('');
  const lastKeyTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar teclas de control solas
      if (e.key.length > 1 && e.key !== 'Enter') return;

      const currentTime = Date.now();
      const diff = currentTime - lastKeyTime.current;

      // Un scanner de mano suele enviar caracteres en ráfagas de menos de 50ms
      if (diff > 50) {
        barcode.current = '';
      }

      lastKeyTime.current = currentTime;

      if (e.key === 'Enter') {
        if (barcode.current.length > 2) {
          onScan(barcode.current);
          barcode.current = '';
        }
      } else {
        barcode.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
}
