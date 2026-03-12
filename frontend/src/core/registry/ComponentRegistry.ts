import { lazy } from 'react';

// Registro de componentes híbridos (Feature-Sliced Design)
// El "Feature Toggle" o contexto de rubro usará este registro para resolver
// la vista a importar en tiempo de ejecución.
const RegistryItems = {
    VariantesGrid: {
        indumentaria: lazy(() => import('../../verticals/indumentaria/components/VariantesGrid.tsx')),
        ferreteria: lazy(() => import('../../verticals/ferreteria/components/VariantesGrid.tsx')),
    },
    FinancialsWidget: {
        ferreteria: lazy(() => import('../../verticals/ferreteria/components/CajaDetalleFerreteria.tsx')),
        indumentaria: null, // Fallback a componente base o nulo
    },
    AgingWidget: {
        ferreteria: lazy(() => import('../../verticals/ferreteria/components/AgingReport.tsx')),
        indumentaria: null,
    },
    StockAlertWidget: {
        ferreteria: lazy(() => import('../../verticals/ferreteria/components/BajoStockFerreteria.tsx')),
        indumentaria: null,
    }
};

export const ComponentRegistry = {
    ...RegistryItems,
    /**
     * Resuelve un componente basado en la llave y el slug del rubro.
     */
    resolve: (key: keyof typeof RegistryItems, rubroSlug: string | null) => {
        const repo = (RegistryItems as any)[key];
        if (!repo) return null;
        // 1. Intenta rubro específico
        if (rubroSlug && repo[rubroSlug]) return repo[rubroSlug];
        // 2. Fallback a indumentaria (por defecto)
        return repo.indumentaria;
    }
};
