import { apiClient } from "../../../lib/apiClient";

export interface ProviderDto {
    id: string;
    razonSocial: string;
    documento: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    saldo: number;
    porcentajeRecargo: number;
}

export interface CreateProviderRequest {
    razonSocial: string;
    documento: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    porcentajeRecargo: number;
}

export const providersApi = {
    getProviders: async (search?: string): Promise<ProviderDto[]> => {
        const response = await apiClient.get<ProviderDto[]>("/proveedores", {
            params: { search }
        });
        return response.data;
    },
    createProvider: async (request: CreateProviderRequest): Promise<string> => {
        const response = await apiClient.post<string>("/proveedores", request);
        return response.data;
    },
    recordInvoice: async (request: any): Promise<{ id: string }> => {
        const response = await apiClient.post<{ id: string }>("/proveedores/factura", request);
        return response.data;
    },
    updateCosts: async (id: string, percentage: number): Promise<boolean> => {
        const response = await apiClient.post<{ success: boolean }>(`/proveedores/${id}/update-costs`, percentage);
        return response.data.success;
    }
};
