import { apiClient } from "../../../lib/apiClient";

export interface Sucursal {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    esDepositoCentral: boolean;
}

export interface CrearSucursalRequest {
    nombre: string;
    direccion: string;
    telefono: string;
    esDepositoCentral: boolean;
}

export const sucursalesApi = {
    getSucursales: async (): Promise<Sucursal[]> => {
        const { data } = await apiClient.get<Sucursal[]>('/sucursales');
        return data;
    },
    crearSucursal: async (request: CrearSucursalRequest): Promise<string> => {
        const { data } = await apiClient.post<string>('/sucursales', request);
        return data;
    },
    actualizarSucursal: async (id: string, request: CrearSucursalRequest): Promise<void> => {
        await apiClient.put(`/sucursales/${id}`, request);
    },
    eliminarSucursal: async (id: string): Promise<void> => {
        await apiClient.delete(`/sucursales/${id}`);
    }
};
