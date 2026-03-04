import { useRegisterSW } from 'virtual:pwa-register/react';
import { DownloadSimple, X } from '@phosphor-icons/react';
import styles from './ReloadPrompt.module.css';

export function ReloadPrompt() {
    // El hook de VitePWA expone el estado para actualización
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: unknown) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.message}>
                {offlineReady
                    ? <span className={styles.text}>App lista para operar offline.</span>
                    : <span className={styles.text}>Hay una nueva actualización disponible.</span>}
            </div>

            <div className={styles.buttons}>
                {needRefresh && (
                    <button
                        className={styles.updateButton}
                        onClick={() => updateServiceWorker(true)}
                    >
                        <DownloadSimple size={16} /> Recargar Ahora
                    </button>
                )}
                <button className={styles.closeButton} onClick={() => close()}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
