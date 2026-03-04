import { useState, useEffect } from 'react';

/**
 * Hook custom para detectar la aparición del teclado virtual en dispositivos móviles,
 * basado en la API VisualViewport experimental.
 */
export function useVisualViewport() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    useEffect(() => {
        if (!window.visualViewport) {
            // Fallback: si no soporta la API, asumimos que no hay teclado virtual problemático
            return;
        }

        const handleResize = () => {
            if (!window.visualViewport) return;

            const vh = window.visualViewport.height;
            const wh = window.innerHeight;

            // Si el visualViewport es significativamente más chico que el innerHeight,
            // (ej. diferencia mayor a 150px), asumimos que el teclado está abierto.
            if (wh - vh > 150) {
                setIsKeyboardOpen(true);
            } else {
                setIsKeyboardOpen(false);
            }
            setViewportHeight(vh);
        };

        window.visualViewport.addEventListener('resize', handleResize);

        // Ejecución inicial
        handleResize();

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    return { isKeyboardOpen, viewportHeight };
}
