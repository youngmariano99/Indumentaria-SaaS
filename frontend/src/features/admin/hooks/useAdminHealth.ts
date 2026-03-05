import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';

export interface DbHealthStats {
    activeConnections: number;
    maxConnections: number;
    databaseSizeBytes: number;
    systemCpuUsagePercentage: number;
    serverTimeUtc: string;
    totalTransactionsCommited: number;
    totalTransactionsRolledBack: number;
    cacheHitRatio: number;
    tupleFetches: number;
}

export const useAdminHealth = () => {
    return useQuery({
        queryKey: ['admin-health-stats'],
        queryFn: async (): Promise<DbHealthStats> => {
            const response = await apiClient.get<DbHealthStats>('/adminhealth/db-stats');
            return response.data;
        },
        refetchInterval: 30000, // Polling automatico cada 30 segundos
        staleTime: 10000 // Se considera obsoleto rápido
    });
};
