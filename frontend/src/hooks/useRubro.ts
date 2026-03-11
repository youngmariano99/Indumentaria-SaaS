import { useRubroStore } from '../store/rubroStore';
import { useCallback } from 'react';

/**
 * Hook universal para adaptar la UI al rubro actual.
 * Permite traducir etiquetas dinámicamente y obtener valores predeterminados.
 */
export const useRubro = () => {
  const translate = useRubroStore((state) => state.translate);
  const rubroId = useRubroStore((state) => state.rubroId);

  const t = useCallback((key: string, fallback?: string) => {
    return translate(key, fallback);
  }, [translate]);

  const getSmartDefaults = useCallback(() => {
    // ID fijo de Indumentaria según Seed del backend
    if (rubroId === 'd1e0f6a2-1234-5678-90ab-cdef01234567') {
      return {
        tipoProducto: 'Ropa',
        escalaTalles: 'AR',
        temporada: 'Temporada Actual',
        metadata: {
          origen: 'Nacional'
        }
      };
    }
    return {};
  }, [rubroId]);

  return {
    t,
    rubroId,
    isIndumentaria: rubroId === 'd1e0f6a2-1234-5678-90ab-cdef01234567',
    getSmartDefaults
  };
};
