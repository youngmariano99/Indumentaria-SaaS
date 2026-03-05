import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';

export interface TenantAdmin {
    id: string;
    nombre: string;
    empresaRazonSocial: string;
    subdominio: string;
    plan: string;
    activo: boolean;
    fechaCreacion: string;
}

export const useAdminTenants = () => {
    return useQuery({
        queryKey: ['admin-tenants'],
        queryFn: async (): Promise<TenantAdmin[]> => {
            // Pega al endpoint centralizado que saltea los filtros de Tenant
            const response = await apiClient.get<TenantAdmin[]>('/admin/tenants');
            return response.data;
        },
        // Al ser data global de administración, no la mantenemos cacheada mucho tiempo
        staleTime: 1000 * 60,
    });
};
