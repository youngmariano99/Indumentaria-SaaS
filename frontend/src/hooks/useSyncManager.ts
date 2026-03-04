import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { posApi } from '../features/pos/api/posApi';

export function useSyncManager() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Actualizar cantidad de pendientes en memoria
    const triggerPendingCountUpdate = async () => {
        try {
            const count = await db.syncQueue.where('status').equals('PENDING').count();
            setPendingCount(count);
            return count;
        } catch (e) {
            console.error('Error constando sync queue', e);
            return 0;
        }
    };

    // Función principal de envío de comandos estancados
    const syncNow = async () => {
        if (!navigator.onLine) return;

        setIsSyncing(true);
        try {
            const pendingItems = await db.syncQueue.where('status').equals('PENDING').toArray();

            for (const item of pendingItems) {
                // Marcar como procesando
                await db.syncQueue.update(item.id!, { status: 'SYNCING' });

                try {
                    let exitoso = false;

                    // Dispatcher rústico según tipo
                    if (item.type === 'VENTA') {
                        await posApi.cobrarTicket(item.payload);
                        exitoso = true;
                    }
                    // TODO: expandir para 'DEVOLUCION', 'ARQUEO_CIERRE', etc..

                    if (exitoso) {
                        // Si la API contestó OK, borramos de IndexedDB local
                        await db.syncQueue.delete(item.id!);
                    }
                } catch (error: any) {
                    console.error(`Fallo sincronizando item ${item.id}`, error);
                    // Devolvemos a Pending, aumentamos reintentos y guardamos error
                    await db.syncQueue.update(item.id!, {
                        status: 'PENDING',
                        retryCount: (item.retryCount || 0) + 1,
                        errorSnapshot: error.message
                    });
                }
            }
        } catch (e) {
            console.error('Error maestro en syncNow', e);
        } finally {
            setIsSyncing(false);
            triggerPendingCountUpdate();
        }
    };

    useEffect(() => {
        triggerPendingCountUpdate();

        const handleOnline = () => {
            setIsOnline(true);
            syncNow(); // Tratar de subir en cuanto vuelva internet
        };
        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Hacer un polling ligero cada minuto por si quedaron huerfanos y hay red
        const intervalId = setInterval(() => {
            if (navigator.onLine) syncNow();
        }, 60000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, []);

    return { isOnline, isSyncing, pendingCount, syncNow };
}
