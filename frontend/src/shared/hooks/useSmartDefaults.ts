import { useRubroStore } from '../../store/rubroStore';

export function useSmartDefaults() {
    const rubroSlug = useRubroStore(s => s.rubroSlug);

    const getDefaults = (context: 'product' | 'provider' | 'invoice') => {
        const base = {
            currency: 'ARS',
            language: 'es-AR',
        };

        if (context === 'product') {
            return {
                ...base,
                estado: 'Activo',
                iva: 21,
                // Si es ferretería, asumimos venta por unidad por defecto
                tipoVenta: rubroSlug === 'ferreteria' ? 'Unidad' : 'Unitaria',
            };
        }

        if (context === 'invoice') {
            return {
                ...base,
                condicionIva: 'Consumidor Final',
                tipoFactura: 'Factura C'
            };
        }

        return base;
    };

    /**
     * Devuelve el término vernáculo basado en el rubro
     */
    const translateLabel = (key: string, fallback: string) => {
        const terms: Record<string, Record<string, string>> = {
            'indumentaria': {
                'variant': 'Talle',
                'variant_color': 'Color',
                'sku': 'Código de Barras',
                'stock': 'Stock en Perchas',
                'category': 'Temporada/Rubro'
            },
            'ferreteria': {
                'sku': 'Código de Producto',
                'stock': 'Stock en Estante',
                'category': 'Pasillo/Sección'
            }
        };

        return terms[rubroSlug || '']?.[key] || fallback;
    };

    return { 
        getDefaults, 
        translateLabel,
        isRubro: (slug: string) => rubroSlug === slug
    };
}
