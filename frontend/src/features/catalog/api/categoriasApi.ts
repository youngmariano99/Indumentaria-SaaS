import { apiClient } from '../../../lib/apiClient';

export interface CategoriaDto {
    id: string;
    nombre: string;
    descripcion: string;
    codigoNcm: string;
    parentCategoryId: string | null;
    subcategorias: CategoriaDto[];
}

export interface CrearCategoriaDto {
    nombre: string;
    descripcion: string;
    codigoNcm: string;
    parentCategoryId: string | null;
}

export interface EditarCategoriaDto {
    nombre: string;
    descripcion: string;
    codigoNcm: string;
    parentCategoryId: string | null;
}

export const categoriasApi = {
    obtenerCategorias: async (): Promise<CategoriaDto[]> => {
        const response = await apiClient.get('/categorias');
        return response.data;
    },

    crearCategoria: async (data: CrearCategoriaDto): Promise<string> => {
        const response = await apiClient.post('/categorias', data);
        return response.data.id;
    },

    editarCategoria: async (id: string, data: EditarCategoriaDto): Promise<void> => {
        await apiClient.put(`/categorias/${id}`, data);
    },

    eliminarCategoria: async (id: string): Promise<void> => {
        await apiClient.delete(`/categorias/${id}`);
    }
};
