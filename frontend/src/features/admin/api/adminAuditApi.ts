import { apiClient as api } from '../../../lib/apiClient';

export interface LogAuditoriaDto {
    id: string;
    tenantId: string;
    userId: string;
    tableName: string;
    primaryKey: string | null;
    action: string;
    oldValues: string | null;
    newValues: string | null;
    ipAddress: string;
    timestamp: string;
}

export interface FraudAlertDto {
    id: string;
    tenantId: string;
    tenantName: string;
    nivelRiesgo: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' | string;
    tipoFraude: string;
    detalles: string;
    usuarioSospechoso: string;
    timestamp: string;
}
export const adminAuditApi = {
    search: async (
        searchTerm?: string,
        tenantId?: string,
        tableName?: string,
        userId?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<LogAuditoriaDto[]> => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (tenantId) params.append('tenantId', tenantId);
        if (tableName) params.append('tableName', tableName);
        if (userId) params.append('userId', userId);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        const response = await api.get(`/api/admin/audit/search?${params.toString()}`);
        return response.data;
    },

    getTimeline: async (entityId: string): Promise<LogAuditoriaDto[]> => {
        const response = await api.get(`/api/admin/audit/timeline/${entityId}`);
        return response.data;
    },

    getFraudAlerts: async (): Promise<FraudAlertDto[]> => {
        const response = await api.get('/api/admin/audit/alerts');
        return response.data;
    }
};
