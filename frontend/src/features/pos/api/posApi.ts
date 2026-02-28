import { apiClient } from "../../../lib/apiClient";

export interface VarianteLayerPosDto {
    varianteId: string;
    sizeColor: string;
    coeficienteStock: number;
}

export interface ProductoLayerPosDto {
    id: string;
    nombre: string;
    precioBase: number;
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
}

export interface CobrarTicketDto {
    metodoPagoId: string;
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
        const response = await apiClient.post<{ ventaId: string; mensaje: string }>("/ventas/cobrar", payload);
        return response.data;
    },
};
