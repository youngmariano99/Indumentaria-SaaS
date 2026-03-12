import { useRubroStore } from '../store/rubroStore';
import { useCallback } from 'react';
import { ComponentRegistry } from '../core/registry/ComponentRegistry';

/**
 * Hook universal para adaptar la UI al rubro actual de forma dinámica.
 * Permite traducir etiquetas y resolver componentes verticales sin if/else.
 */
export const useRubro = () => {
  const translate = useRubroStore((state) => state.translate);
  const rubroId = useRubroStore((state) => state.rubroId);
  const rubroSlug = useRubroStore((state) => state.rubroSlug);

  const t = useCallback((key: string, fallback?: string) => {
    return translate(key, fallback);
  }, [translate]);

  /**
   * Resuelve dinámicamente el componente correcto del registro
   */
  const resolveComponent = useCallback((key: any) => {
    return ComponentRegistry.resolve(key, rubroSlug);
  }, [rubroSlug]);

  const getSmartDefaults = useCallback(() => {
    // Usamos el slug en lugar de IDs harcodeados
    if (rubroSlug === 'indumentaria') {
      return {
        tipoProducto: 'Ropa',
        escalaTalles: 'AR',
        temporada: 'Temporada Actual',
        metadata: {
          origen: 'Nacional'
        }
      };
    }
    if (rubroSlug === 'ferreteria') {
      return {
        tipoProducto: 'Herramienta',
        metadata: {
          material: 'Acero'
        }
      };
    }
    return {};
  }, [rubroSlug]);

  return {
    t,
    rubroId,
    rubroSlug,
    isIndumentaria: rubroSlug === 'indumentaria',
    isFerreteria: rubroSlug === 'ferreteria',
    getSmartDefaults,
    resolveComponent
  };
};
