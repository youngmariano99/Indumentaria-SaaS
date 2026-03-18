import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sucursalesApi, type CrearSucursalRequest } from "../api/sucursalesApi";

export function useSucursales() {
    const queryClient = useQueryClient();

    const sucursalesQuery = useQuery({
        queryKey: ['sucursales'],
        queryFn: sucursalesApi.getSucursales
    });

    const createMutation = useMutation({
        mutationFn: sucursalesApi.crearSucursal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sucursales'] });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: string, request: CrearSucursalRequest }) => 
            sucursalesApi.actualizarSucursal(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sucursales'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: sucursalesApi.eliminarSucursal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sucursales'] });
        }
    });

    return {
        sucursales: sucursalesQuery.data ?? [],
        isLoading: sucursalesQuery.isLoading,
        isError: sucursalesQuery.isError,
        crearSucursal: createMutation.mutateAsync,
        actualizarSucursal: updateMutation.mutateAsync,
        eliminarSucursal: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
}
