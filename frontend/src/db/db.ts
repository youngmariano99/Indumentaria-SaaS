import Dexie, { type EntityTable } from 'dexie';

// Interfaces extendidas para la DB local basados en nuestros DTOs / Entidades reales
export interface LocalProducto {
    id: string; // uuid
    nombre: string;
    codigoBodega: string | null;
    categoriaId: string | null;
    categoriaNombre: string | null;
    marcaId: string | null;
    marcaNombre: string | null;
    precioBase: number;
    impuestoPorcentaje: number | null;
    esFraccionable: boolean;
    estado: string; // "Activo", "Inactivo"
    // Atributos de búsqueda rápida offline
    _searchIndex: string;
    // Copia simplificada de las variantes para el POS offline
    variantes: {
        id: string;
        sku: string;
        talle: string;
        color: string;
        stockVenta: number;
        precioVenta: number | null;
    }[];
}

export interface SyncQueueItem {
    id?: number; // Auto-incremented local ID
    type: 'VENTA' | 'DEVOLUCION' | 'ARQUEO_CIERRE';
    payload: any; // El JSON que debió ir al backend
    timestamp: number;
    status: 'PENDING' | 'SYNCING' | 'ERROR';
    retryCount: number;
    errorSnapshot?: string;
}

export class PosDatabase extends Dexie {
    productos!: EntityTable<LocalProducto, 'id'>;
    syncQueue!: EntityTable<SyncQueueItem, 'id'>;

    constructor() {
        super('IndumentariaPosDB');

        // Versión 2: Se agrega esFraccionable a productos
        this.version(2).stores({
            productos: 'id, codigoBodega, _searchIndex',
            syncQueue: '++id, type, status, timestamp'
        });
    }
}

export const db = new PosDatabase();
