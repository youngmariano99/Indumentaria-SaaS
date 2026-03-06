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
    deudaOrigenId?: string | null;
}

export interface PrendaEnCursoDto {
    id: string;
    varianteProductoId?: string | null;
    productoNombre: string;
    varianteNombre: string;
    cantidad: number;
    precioReferencia: number;
    estado: string;
    fecha: string;
}

export interface Cliente360Dto extends ClienteDto {
    totalGastadoHistorico: number;
    cantidadComprasHistoricas: number;
    fechaUltimaCompra?: string;
    ticketPromedio: number;
    historialTransacciones: TransaccionHistoricoDto[];
    prendasEnCurso: PrendaEnCursoDto[];
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

    agregarSaldo: async (id: string, monto: number, descripcion: string, metodoPagoId?: string, deudaOrigenId?: string): Promise<number> => {
        const response = await apiClient.post<number>(`/Clientes/${id}/saldo/sumar`, { monto, descripcion, metodoPagoId, deudaOrigenId });
        return response.data;
    },

    descontarSaldo: async (id: string, monto: number, descripcion: string, metodoPagoId?: string): Promise<number> => {
        const response = await apiClient.post<number>(`/Clientes/${id}/saldo/restar`, { monto, descripcion, metodoPagoId });
        return response.data;
    },

    crearPrendaEnCurso: async (
        clienteId: string,
        data: {
            varianteProductoId?: string;
            productoManualNombre?: string;
            varianteManualNombre?: string;
            cantidad: number;
            precioReferencia: number;
            estadoInicial: 'EnPrueba' | 'Deuda';
        }
    ): Promise<string> => {
        const response = await apiClient.post<string>(`/Clientes/${clienteId}/prendas-en-curso`, data);
        return response.data;
    },

    cambiarEstadoPrendaEnCurso: async (
        prendaId: string,
        nuevoEstado: "EnPrueba" | "Pagada" | "Deuda" | "Devuelta"
    ): Promise<void> => {
        await apiClient.put(`/Clientes/prendas-en-curso/${prendaId}/estado`, {
            prendaId,
            nuevoEstado,
        });
    }
}
