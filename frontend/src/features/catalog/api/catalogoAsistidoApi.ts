import { apiClient } from "../../../lib/apiClient";

export interface VarianteStockResumenDto {
  varianteId: string;
  sku: string;
  talle: string;
  color: string;
  stockActual: number;
}

export interface ProductoStockResumenDto {
  productoId: string;
  nombre: string;
  stockTotal: number;
  variantes: VarianteStockResumenDto[];
}

export interface ProductoVentaSemanaDto {
  productoId: string;
  nombre: string;
  unidadesVendidas: number;
  importeTotal: number;
}

export const catalogoAsistidoApi = {
  getStockBajo: async (umbral: number = 7): Promise<ProductoStockResumenDto[]> => {
    const response = await apiClient.get<ProductoStockResumenDto[]>(
      `/catalogoasistido/stock-bajo`,
      { params: { umbral } },
    );
    return response.data;
  },

  getSinStock: async (): Promise<ProductoStockResumenDto[]> => {
    const response = await apiClient.get<ProductoStockResumenDto[]>(
      `/catalogoasistido/sin-stock`,
    );
    return response.data;
  },

  getTopVendidosSemana: async (
    topN: number = 3,
  ): Promise<ProductoVentaSemanaDto[]> => {
    const response = await apiClient.get<ProductoVentaSemanaDto[]>(
      `/catalogoasistido/top-vendidos-semana`,
      { params: { topN } },
    );
    return response.data;
  },
};

