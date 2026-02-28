import { apiClient } from '../../../lib/apiClient';
import type { CrearProductoDto, ProductoConVariantes } from '../types';

export const catalogApi = {
    /**
     * Lista todos los productos del tenant con sus variantes.
     * Endpoint: GET /api/productos
     */
    obtenerCatalogo: async (): Promise<ProductoConVariantes[]> => {
        const response = await apiClient.get<ProductoConVariantes[]>('/productos');
        return response.data;
    },

    /**
     * Obtiene un producto individual por ID.
     * Endpoint: GET /api/productos/{id}
     */
    obtenerProductoPorId: async (id: string): Promise<ProductoConVariantes> => {
        const response = await apiClient.get<ProductoConVariantes>(`/productos/${id}`);
        return response.data;
    },

    /**
     * Crea un producto con todas sus variantes en una sola transacción.
     * Endpoint: POST /api/productos/matrix
     */
    crearProductoConVariantes: async (data: CrearProductoDto): Promise<{ id: string }> => {
        const response = await apiClient.post<{ id: string }>('/productos/matrix', data);
        return response.data;
    },

    /**
     * Edita un producto y sus variantes (Costo, Override, Atributos).
     * Endpoint: PUT /api/productos/{id}
     */
    editarProducto: async (id: string, data: any): Promise<void> => {
        await apiClient.put(`/productos/${id}`, data);
    },

    /**
     * Aplica baja lógica a un producto y sus variantes para ocultarlo sin romper historial.
     * Endpoint: DELETE /api/productos/{id}
     */
    eliminarProducto: async (id: string): Promise<void> => {
        await apiClient.delete(`/productos/${id}`);
    }
};
