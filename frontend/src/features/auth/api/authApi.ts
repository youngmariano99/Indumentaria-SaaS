import { apiClient } from '../../../lib/apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    /**
     * Registra un nuevo negocio (Tenant) con su administrador inicial.
     * Endpoint: POST /api/auth/register-admin-temp
     * El campo `subdominio` actúa como identificador único del negocio.
     */
    register: async (data: RegisterRequest): Promise<void> => {
        await apiClient.post('/auth/register-admin-temp', data);
    },
};
