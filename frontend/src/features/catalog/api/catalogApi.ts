import { apiClient } from '../../../lib/apiClient';
import type { CrearProductoDto } from '../types';

export const catalogApi = {
    /**
     * Crea un producto con todas sus variantes (matriz talle/color) en una sola transacción.
     * Endpoint: POST /api/productos/matrix
     * Requiere JWT (el apiClient lo inyecta automáticamente).
     */
    crearProductoConVariantes: async (data: CrearProductoDto): Promise<{ id: string }> => {
        const response = await apiClient.post<{ id: string }>('/productos/matrix', data);
        return response.data;
    },
};
