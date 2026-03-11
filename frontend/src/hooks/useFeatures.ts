import { useEffect } from 'react';
import { useFeatureStore } from '../store/featureStore';

/**
 * Hook para consultar funcionalidades (Feature Toggles) de forma sencilla.
 * @returns Un objeto con métodos para verificar features y el estado de carga.
 */
export const useFeatures = () => {
  const { isEnabled, fetchFeatures, initialized, isLoading } = useFeatureStore();

  // Cargamos automáticamente si no está inicializado
  useEffect(() => {
    if (!initialized && !isLoading) {
      fetchFeatures();
    }
  }, [initialized, isLoading, fetchFeatures]);

  return {
    /**
     * Verifica si una funcionalidad está activa.
     * @param key Clave de la feature (ej: 'ModuloCRM', 'VentaOffline')
     */
    isEnabled: (key: string) => isEnabled(key),
    isLoading,
    initialized,
    refreshFeatures: fetchFeatures
  };
};
