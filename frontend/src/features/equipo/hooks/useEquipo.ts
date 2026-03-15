import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoApi } from '../api/equipoApi';

export function useEquipo() {
    const queryClient = useQueryClient();

    const equipoQuery = useQuery({
        queryKey: ['equipo'],
        queryFn: equipoApi.getEquipo
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

    return {
        colaboradores: equipoQuery.data ?? [],
        isLoading: equipoQuery.isLoading,
        isError: equipoQuery.isError,
        crearColaborador: createMutation.mutateAsync,
        actualizarPermisos: updatePermisosMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updatePermisosMutation.isPending
    };
}
