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
    saldoAFavor: number;
    totalCompras: number;
    totalGastado: number;
    categoriaPreferida: string;
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

export interface CompraRecienteDetalleDto {
    varianteProductoId: string;
    productoNombre: string;
    varianteNombre: string;
    cantidad: number;
    precioUnitario: number;
    posibleDevolucion?: boolean;
}

export interface TransaccionHistoricoDto {
    id: string;
    fecha: string;
    tipo: string;
    montoTotal: number;
    descripcion: string;
    detalles?: CompraRecienteDetalleDto[];
}

export interface Cliente360Dto extends ClienteDto {
    totalGastadoHistorico: number;
    cantidadComprasHistoricas: number;
    fechaUltimaCompra?: string;
    ticketPromedio: number;
    historialTransacciones: TransaccionHistoricoDto[];
}

export const clientesApi = {
    getAll: async (): Promise<ClienteDto[]> => {
        const response = await apiClient.get<ClienteDto[]>('/Clientes');
        return response.data;
    },

    getPerfil360: async (id: string): Promise<Cliente360Dto> => {
        const response = await apiClient.get<Cliente360Dto>(`/Clientes/${id}/perfil-360`);
        return response.data;
    },

    create: async (data: CrearClienteDto): Promise<ClienteDto> => {
        const payload = { ...data, preferenciasJson: data.preferenciasJson || "{}" };
        const response = await apiClient.post<ClienteDto>('/Clientes', payload);
        return response.data;
    },

    update: async (id: string, data: EditarClienteDto): Promise<ClienteDto> => {
        const payload = { ...data, preferenciasJson: data.preferenciasJson || "{}" };
        const response = await apiClient.put<ClienteDto>(`/Clientes/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/Clientes/${id}`);
    },

    agregarSaldo: async (id: string, monto: number, descripcion: string): Promise<number> => {
        const response = await apiClient.post<number>(`/Clientes/${id}/saldo/sumar`, { monto, descripcion });
        return response.data;
    },

    descontarSaldo: async (id: string, monto: number, descripcion: string): Promise<number> => {
        const response = await apiClient.post<number>(`/Clientes/${id}/saldo/restar`, { monto, descripcion });
        return response.data;
    }
}
