import { useState, useCallback } from 'react';
import { printerService, PrinterInterface } from '../lib/printing/PrinterService';
import type { PrinterStatus } from '../lib/printing/PrinterService';

export const usePrinter = () => {
    const [status, setStatus] = useState<PrinterStatus>({
        interface: null,
        connected: false
    });

    const connectSerial = useCallback(async () => {
        try {
            const success = await printerService.connectSerial();
            if (success) {
                setStatus({ interface: PrinterInterface.Serial, connected: true });
            } else {
                setStatus({ interface: null, connected: false, error: 'No se pudo conectar al puerto Serial.' });
            }
        } catch (err: any) {
            setStatus({ interface: null, connected: false, error: err.message });
        }
    }, []);

    const connectBluetooth = useCallback(async () => {
        try {
            const success = await printerService.connectBluetooth();
            if (success) {
                setStatus({ interface: PrinterInterface.Bluetooth, connected: true });
            } else {
                setStatus({ interface: null, connected: false, error: 'No se pudo vincular por Bluetooth.' });
            }
        } catch (err: any) {
            setStatus({ interface: null, connected: false, error: err.message });
        }
    }, []);

    const disconnect = useCallback(async () => {
        await printerService.disconnect();
        setStatus({ interface: null, connected: false });
    }, []);

    const printTicket = useCallback(async (lines: string[]) => {
        const buffer = printerService.generateEscPosTicket(lines);
        const success = await printerService.printRaw(buffer);

        if (!success) {
            // Si falla la impresión directa, devolvemos false para que el componente
            // pueda disparar el fallback (window.print o PDF)
            return false;
        }
        return true;
    }, []);

    return {
        status,
        connectSerial,
        connectBluetooth,
        disconnect,
        printTicket
    };
};
