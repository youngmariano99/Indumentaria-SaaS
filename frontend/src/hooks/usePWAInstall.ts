import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Evitar que Chrome muestre el prompt por defecto
            e.preventDefault();
            // Guardar el evento para dispararlo más tarde
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt nativo
        await deferredPrompt.prompt();

        // Esperar a que el usuario responda
        const { outcome } = await deferredPrompt.userChoice;

        // Opcional: registrar analíticas de outcome === 'accepted' o 'dismissed'
        console.log(`User interaction with A2HS prompt: ${outcome}`);

        // Limpiar la referencia
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, promptInstall };
}
