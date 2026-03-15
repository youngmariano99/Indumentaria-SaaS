import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Colaborador {
    id: string;
    nombre: string;
    email: string;
    rol: string | number;
    permisos: Record<string, boolean>;
}

export const equipoApi = {
    getEquipo: async (): Promise<Colaborador[]> => {
        const response = await axios.get(`${API_URL}/equipo`);
        return response.data;
    },
    crearColaborador: async (data: any): Promise<string> => {
        const response = await axios.post(`${API_URL}/equipo`, data);
        return response.data;
    },
    actualizarPermisos: async (id: string, permisos: Record<string, boolean>): Promise<void> => {
        await axios.put(`${API_URL}/equipo/${id}/permisos`, { permisos });
    }
};
