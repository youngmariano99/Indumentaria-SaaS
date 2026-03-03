import { apiClient } from "../../../lib/apiClient";

export interface ArqueoDetalleDto {
    metodoPagoId: string;
    metodoPagoNombre: string;
    montoEsperado: number;
    montoReal: number;
    diferencia: number;
}

export interface ArqueoDto {
    id: string;
    storeId: string;
    storeNombre: string;
    usuarioId: string;
    usuarioNombre: string;
    fechaApertura: string;
    fechaCierre: string | null;
    saldoInicial: number;
    totalVentasEsperado: number;
    totalManualEsperado: number;
    totalRealContado: number;
    diferencia: number;
    estado: string;
    observaciones: string | null;
    detalles: ArqueoDetalleDto[];
}

export interface AbrirCajaDto {
    storeId: string;
    saldoInicial: number;
}

export interface CerrarCajaDetalleDto {
    metodoPagoId: string;
    montoReal: number;
}

export interface CerrarCajaDto {
    observaciones: string | null;
    detallesReales: CerrarCajaDetalleDto[];
}

export const arqueoApi = {
    getActual: async (storeId: string): Promise<ArqueoDto> => {
        const response = await apiClient.get<ArqueoDto>(`/arqueocaja/actual/${storeId}`);
        return response.data;
    },
    abrir: async (payload: AbrirCajaDto): Promise<string> => {
        const response = await apiClient.post<string>("/arqueocaja/abrir", payload);
        return response.data;
    },
    cerrar: async (id: string, payload: CerrarCajaDto): Promise<boolean> => {
        const response = await apiClient.post<boolean>(`/arqueocaja/cerrar/${id}`, payload);
        return response.data;
    }
};
