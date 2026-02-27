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
     * Crea un producto con todas sus variantes en una sola transacción.
     * Endpoint: POST /api/productos/matrix
     */
    crearProductoConVariantes: async (data: CrearProductoDto): Promise<{ id: string }> => {
        const response = await apiClient.post<{ id: string }>('/productos/matrix', data);
        return response.data;
    },
};
