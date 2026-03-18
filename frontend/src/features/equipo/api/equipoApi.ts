import { apiClient } from '../../../lib/apiClient';

export interface Colaborador {
    id: string;
    nombre: string;
    email: string;
    rol: string | number;
    tienePin: boolean;
    permisos: Record<string, boolean>;
}

export const equipoApi = {
    getEquipo: async (): Promise<Colaborador[]> => {
        const response = await apiClient.get(`/equipo`);
        return response.data;
    },
    crearColaborador: async (data: any): Promise<string> => {
        const response = await apiClient.post(`/equipo`, data);
        return response.data;
    },
    actualizarPermisos: async (id: string, permisos: Record<string, boolean>): Promise<void> => {
        await apiClient.put(`/equipo/${id}/permisos`, { permisos });
    },
    actualizarPin: async (id: string, pin: string): Promise<void> => {
        await apiClient.put(`/equipo/${id}/pin`, JSON.stringify(pin));
    },
    accesoRapido: async (pin: string): Promise<any> => {
        const response = await apiClient.post(`/equipo/acceso-rapido`, JSON.stringify(pin));
        return response.data;
    },
    getAuditoria: async (): Promise<any[]> => {
        const response = await apiClient.get(`/equipo/auditoria`);
        return response.data;
    }
};
