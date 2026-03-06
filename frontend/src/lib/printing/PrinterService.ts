/**
 * PrinterService.ts
 * Motor de impresión universal 3-tier: Web Serial, Web Bluetooth y PDF Fallback.
 * Soporta comandos ESC/POS básicos.
 */

export const PrinterInterface = {
    Serial: 'Serial',
    Bluetooth: 'Bluetooth',
    PDF: 'PDF'
} as const;

export type PrinterInterface = typeof PrinterInterface[keyof typeof PrinterInterface];

export interface PrinterStatus {
    interface: PrinterInterface | null;
    connected: boolean;
    error?: string;
}

class PrinterService {
    private serialPort: any | null = null;
    private bluetoothDevice: any | null = null;
    private bluetoothCharacteristic: any | null = null;

    // --- COMANDOS ESC/POS ---
    private static readonly ESC = 0x1B;
    private static readonly GS = 0x1D;
    private static readonly INIT = new Uint8Array([PrinterService.ESC, 0x40]);
    private static readonly BOLD_ON = new Uint8Array([PrinterService.ESC, 0x45, 0x01]);
    private static readonly BOLD_OFF = new Uint8Array([PrinterService.ESC, 0x45, 0x00]);
    private static readonly ALIGN_CENTER = new Uint8Array([PrinterService.ESC, 0x61, 0x01]);
    private static readonly ALIGN_LEFT = new Uint8Array([PrinterService.ESC, 0x61, 0x00]);
    private static readonly CUT = new Uint8Array([PrinterService.GS, 0x56, 0x00]);

    /**
     * Intenta conectar vía Web Serial (USB)
     */
    async connectSerial(): Promise<boolean> {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial no soportado en este navegador.');
        }

        try {
            const port = await (navigator as any).serial.requestPort();
            await port.open({ baudRate: 9600 });
            this.serialPort = port;
            return true;
        } catch (error) {
            console.error('Error conectando Serial:', error);
            return false;
        }
    }

    /**
     * Intenta conectar vía Web Bluetooth
     */
    async connectBluetooth(): Promise<boolean> {
        if (!('bluetooth' in navigator)) {
            throw new Error('Web Bluetooth no soportado en este navegador.');
        }

        try {
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // UUID común para impresoras
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            const characteristics = await service.getCharacteristics();

            // Buscamos una característica con propiedad de escritura
            const writeChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

            if (writeChar) {
                this.bluetoothDevice = device;
                this.bluetoothCharacteristic = writeChar;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error conectando Bluetooth:', error);
            return false;
        }
    }

    /**
     * Envía comandos binarios a la impresora conectada
     */
    async printRaw(data: Uint8Array): Promise<boolean> {
        // 1. Prioridad: Serial
        if (this.serialPort && this.serialPort.writable) {
            const writer = this.serialPort.writable.getWriter();
            try {
                await writer.write(data);
                return true;
            } finally {
                writer.releaseLock();
            }
        }

        // 2. Prioridad: Bluetooth
        if (this.bluetoothCharacteristic) {
            try {
                // Bluetooth suele tener un límite de MTU (aprox 20-512 bytes)
                // Fragmentamos el envío si es necesario
                const CHUNK_SIZE = 20;
                for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                    const chunk = data.slice(i, i + CHUNK_SIZE);
                    await this.bluetoothCharacteristic.writeValue(chunk);
                }
                return true;
            } catch (error) {
                console.error('Error enviando a Bluetooth:', error);
                return false;
            }
        }

        return false; // Requiere fallback a PDF
    }

    /**
     * Helper para generar un ticket ESC/POS a partir de texto y formato
     */
    generateEscPosTicket(lines: string[]): Uint8Array {
        const encoder = new TextEncoder();
        const chunks: Uint8Array[] = [PrinterService.INIT];

        for (const line of lines) {
            if (line === '---') {
                chunks.push(encoder.encode('--------------------------------\n'));
            } else if (line.startsWith('[B]')) {
                chunks.push(PrinterService.BOLD_ON);
                chunks.push(encoder.encode(line.replace('[B]', '') + '\n'));
                chunks.push(PrinterService.BOLD_OFF);
            } else if (line.startsWith('[C]')) {
                chunks.push(PrinterService.ALIGN_CENTER);
                chunks.push(encoder.encode(line.replace('[C]', '') + '\n'));
                chunks.push(PrinterService.ALIGN_LEFT);
            } else {
                chunks.push(encoder.encode(line + '\n'));
            }
        }

        chunks.push(new Uint8Array([0x0A, 0x0A, 0x0A])); // Feeds
        chunks.push(PrinterService.CUT);

        // Combinar en un solo Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result;
    }

    /**
     * Desconecta los dispositivos
     */
    async disconnect() {
        if (this.serialPort) {
            await this.serialPort.close();
            this.serialPort = null;
        }
        if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
            this.bluetoothDevice.gatt.disconnect();
            this.bluetoothDevice = null;
            this.bluetoothCharacteristic = null;
        }
    }
}

export const printerService = new PrinterService();
