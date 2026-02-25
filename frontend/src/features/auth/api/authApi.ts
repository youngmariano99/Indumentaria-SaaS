import { apiClient } from '../../../lib/apiClient';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    },
};
