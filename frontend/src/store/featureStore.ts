import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';

interface FeatureState {
  features: Record<string, boolean>;
  isLoading: boolean;
  initialized: boolean;
  fetchFeatures: () => Promise<void>;
  isEnabled: (key: string) => boolean;
}

/**
 * Store centralizado para gestionar las funcionalidades (Feature Toggles) habilitadas.
 * Se alimenta del backend considerando la jerarquía: Usuario > Sucursal > Inquilino > Rubro.
 */
export const useFeatureStore = create<FeatureState>((set, get) => ({
  features: {},
  isLoading: false,
  initialized: false,
  fetchFeatures: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<Record<string, boolean>>('/features/my-features');
      set({ features: response.data, initialized: true });
    } catch (error) {
      console.error('Error al cargar Feature Toggles:', error);
      // Fallback: si falla la API, asumimos que no hay features extra activas
      set({ initialized: true });
    } finally {
      set({ isLoading: false });
    }
  },
  isEnabled: (key: string) => {
    // Si no está inicializado, podríamos querer disparar un fetch, 
    // pero por ahora devolvemos el estado actual (default false)
    return !!get().features[key];
  },
}));
