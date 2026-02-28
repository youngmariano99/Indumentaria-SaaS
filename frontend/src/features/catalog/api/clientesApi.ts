import { apiClient } from '../../../lib/apiClient';
import { CondicionIva } from '../types';

export interface ClienteDto {
    id: string;
    documento: string;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    condicionIva?: CondicionIva;
    preferenciasJson: string;
}

export interface CrearClienteDto {
    documento: string;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    condicionIva?: CondicionIva;
    preferenciasJson?: string;
}

export interface EditarClienteDto {
    id: string;
    documento: string;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    condicionIva?: CondicionIva;
    preferenciasJson?: string;
}

export interface CompraRecienteDto {
    ventaId: string;
    fecha: string;
    montoTotal: number;
    identificadorTicket: string;
}

export interface Cliente360Dto extends ClienteDto {
    totalGastadoHistorico: number;
    cantidadComprasHistoricas: number;
    fechaUltimaCompra?: string;
    ticketPromedio: number;
    comprasRecientes: CompraRecienteDto[];
}

export const clientesApi = {
    getAll: async (): Promise<ClienteDto[]> => {
        const response = await apiClient.get<ClienteDto[]>('/api/Clientes');
        return response.data;
    },

    getPerfil360: async (id: string): Promise<Cliente360Dto> => {
        const response = await apiClient.get<Cliente360Dto>(`/api/Clientes/${id}/perfil-360`);
        return response.data;
    },

    create: async (data: CrearClienteDto): Promise<ClienteDto> => {
        const payload = { ...data, preferenciasJson: data.preferenciasJson || "{}" };
        const response = await apiClient.post<ClienteDto>('/api/Clientes', payload);
        return response.data;
    },

    update: async (id: string, data: EditarClienteDto): Promise<ClienteDto> => {
        const payload = { ...data, preferenciasJson: data.preferenciasJson || "{}" };
        const response = await apiClient.put<ClienteDto>(`/api/Clientes/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/Clientes/${id}`);
    }
}
