import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SucursalState {
    sucursalId: string | null;
    sucursalNombre: string | null;
    setSucursal: (id: string | null, nombre: string | null) => void;
    clearSucursal: () => void;
}

export const useSucursalStore = create<SucursalState>()(
    persist(
        (set) => ({
            sucursalId: null,
            sucursalNombre: null,
            setSucursal: (id, nombre) => set({ sucursalId: id, sucursalNombre: nombre }),
            clearSucursal: () => set({ sucursalId: null, sucursalNombre: null }),
        }),
        {
            name: 'sucursal-storage',
        }
    )
);
