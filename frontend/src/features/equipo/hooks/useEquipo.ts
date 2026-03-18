import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoApi } from '../api/equipoApi';
import { useAuthStore } from '../../auth/store/authStore';

export function useEquipo() {
    const queryClient = useQueryClient();

    const { user } = useAuthStore();
    const isOwner = user?.rol?.toString() === '2' || user?.rol === 'Owner' || user?.rol === 'owner';

    const equipoQuery = useQuery({
        queryKey: ['equipo'],
        queryFn: equipoApi.getEquipo,
        enabled: isOwner
    });

    const createMutation = useMutation({
        mutationFn: equipoApi.crearColaborador,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipo'] });
        }
    });

    const updatePermisosMutation = useMutation({
        mutationFn: ({ id, permisos }: { id: string, permisos: Record<string, boolean> }) => 
            equipoApi.actualizarPermisos(id, permisos),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipo'] });
        }
    });

    const updatePinMutation = useMutation({
        mutationFn: ({ id, pin }: { id: string, pin: string }) => 
            equipoApi.actualizarPin(id, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipo'] });
        }
    });

    const fastAuthMutation = useMutation({
        mutationFn: equipoApi.accesoRapido
    });

    const auditoriaQuery = useQuery({
        queryKey: ['equipo', 'auditoria'],
        queryFn: equipoApi.getAuditoria,
        enabled: isOwner && !!equipoQuery.data
    });

    return {
        colaboradores: equipoQuery.data ?? [],
        logsAuditoria: auditoriaQuery.data ?? [],
        isLoading: equipoQuery.isLoading,
        isLoadingAuditoria: auditoriaQuery.isLoading,
        isError: equipoQuery.isError,
        crearColaborador: createMutation.mutateAsync,
        actualizarPermisos: updatePermisosMutation.mutateAsync,
        actualizarPin: updatePinMutation.mutateAsync,
        autenticarPin: fastAuthMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updatePermisosMutation.isPending,
        isAuthenticating: fastAuthMutation.isPending
    };
}
