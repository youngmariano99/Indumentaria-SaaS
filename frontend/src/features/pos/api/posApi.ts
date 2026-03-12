import { apiClient } from "../../../lib/apiClient";
import { db } from "../../../db/db";

export interface VarianteLayerPosDto {
    varianteId: string;
    sizeColor: string;
    talle: string;
    color: string;
    sku: string;
    stockActual: number;
}

export interface ProductoLayerPosDto {
    id: string;
    nombre: string;
    precioBase: number;
    ean13: string;
    esFraccionable: boolean;
    variantes: VarianteLayerPosDto[];
}

export interface MetodoPagoDto {
    id: string;
    nombre: string;
    descripcion: string;
}

export interface CobrarTicketDetalleDto {
    varianteProductoId: string;
    cantidad: number;
    precioUnitarioDeclarado: number;
    posibleDevolucion?: boolean;
}

export interface CobrarTicketDto {
    metodoPagoId: string;
    clienteId?: string;
    usarSaldoCliente?: boolean;
    montoTotalDeclarado: number;
    descuentoGlobalPct: number;
    recargoGlobalPct: number;
    notas?: string;
    detalles: CobrarTicketDetalleDto[];
}

export const posApi = {
    obtenerCatalogoPos: async (): Promise<ProductoLayerPosDto[]> => {
        const response = await apiClient.get<ProductoLayerPosDto[]>("/ventas/pos-grid");
        return response.data;
    },

    obtenerMetodosPago: async (): Promise<MetodoPagoDto[]> => {
        const response = await apiClient.get<MetodoPagoDto[]>("/ventas/metodos-pago");
        return response.data;
    },

    cobrarTicket: async (payload: CobrarTicketDto): Promise<{ ventaId: string; mensaje: string }> => {
        if (!navigator.onLine) {
            // Guardar en cola local
            await db.syncQueue.add({
                type: 'VENTA',
                payload,
                timestamp: Date.now(),
                status: 'PENDING',
                retryCount: 0
            });
            return { ventaId: 'offline-pending', mensaje: 'Venta guardada localmente (Modo Offline).' };
        }

        try {
            const response = await apiClient.post<{ ventaId: string; mensaje: string }>("/ventas/cobrar", payload);
            return response.data;
        } catch (error: any) {
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                await db.syncQueue.add({
                    type: 'VENTA',
                    payload,
                    timestamp: Date.now(),
                    status: 'PENDING',
                    retryCount: 0
                });
                return { ventaId: 'offline-pending', mensaje: 'Fallo de Red. Venta encolada para sincronización.' };
            }
            throw error;
        }
    },

    sincronizarCatalogoLocal: async (): Promise<void> => {
        if (!navigator.onLine) return; // Si no hay internet, preservamos el cache viejo

        try {
            const data = await posApi.obtenerCatalogoPos();

            // Limpiar tabla productos y repoblar (en una transacción)
            await db.transaction('rw', db.productos, async () => {
                await db.productos.clear();

                // Mapear el ProductoLayerPosDto al LocalProducto que armamos en db.ts
                const docsLocal = data.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    codigoBodega: p.ean13 || null,
                    categoriaId: null,
                    categoriaNombre: null,
                    marcaId: null,
                    marcaNombre: null,
                    precioBase: p.precioBase,
                    esFraccionable: p.esFraccionable,
                    impuestoPorcentaje: null,
                    estado: 'Activo',
                    _searchIndex: `${p.nombre} ${p.ean13 || ''}`.toLowerCase(),
                    variantes: p.variantes.map(v => ({
                        id: v.varianteId,
                        sku: v.sku,
                        talle: v.talle,
                        color: v.color,
                        stockVenta: v.stockActual,
                        precioVenta: null
                    }))
                }));

                await db.productos.bulkAdd(docsLocal);
            });
        } catch (e) {
            console.error('No se pudo bajar el catalogo local', e);
        }
    },

    procesarDevolucion: async (payload: any): Promise<{ devolucionId: string; mensaje: string }> => {
        const response = await apiClient.post<{ devolucionId: string; mensaje: string }>("/ventas/devolucion", payload);
        return response.data;
    },

    buscarProductos: async (termino: string): Promise<ProductoLayerPosDto[]> => {
        const response = await apiClient.get<ProductoLayerPosDto[]>("/ventas/buscar", { params: { t: termino } });
        return response.data;
    },

    getVentaByTicket: async (identificador: string): Promise<any> => {
        const response = await apiClient.get<any>(`/ventas/ticket/${identificador}`);
        return response.data;
    },
};
