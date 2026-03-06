import { apiClient as api } from '../../../lib/apiClient';

export interface UsageStats {
    globalDau: number;
    topTenants: {
        tenantId: string;
        tenantName: string;
        activeUsersCount: number;
        growthPercentage: number;
    }[];
}

export interface GhostInventory {
    tenantId: string;
    tenantName: string;
    productoId: string;
    nombreProducto: string;
    stockActual: number;
    ultimaVenta: string;
    probabilidadDiscrepancia: number;
}

export interface ChurnRisk {
    tenantId: string;
    tenantName: string;
    nivelRiesgo: string;
    motivo: string;
    ultimaActividadSignificativa: string;
}

export const adminInsightsApi = {
    getUsageStats: async (): Promise<UsageStats> => {
        const response = await api.get('/api/admin/insights/usage');
        return response.data;
    },
    getGhostInventory: async (): Promise<GhostInventory[]> => {
        const response = await api.get('/api/admin/insights/ghost-inventory');
        return response.data;
    },
    getChurnRisk: async (): Promise<ChurnRisk[]> => {
        const response = await api.get('/api/admin/insights/churn-risk');
        return response.data;
    }
};
