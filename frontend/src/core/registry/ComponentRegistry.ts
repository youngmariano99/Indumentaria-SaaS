import { lazy } from 'react';

// Registro de componentes híbridos (Feature-Sliced Design)
// El "Feature Toggle" o contexto de rubro usará este registro para resolver
// la vista a importar en tiempo de ejecución.
export const ComponentRegistry = {
    VariantesGrid: {
        // Por ahora, apuntamos la lógica existente de indumentaria aquí.
        // En un futuro, si el rubro es Ferretería, React cargará perezosamente
        // import('../../verticals/ferreteria/components/VariantesGrid')
        indumentaria: lazy(() => import('../../verticals/indumentaria/components/VariantesGrid.tsx')),
        ferreteria: lazy(() => import('../../verticals/ferreteria/components/VariantesGrid.tsx')),
    }
    // Agregar aquí más componentes modulares en el futuro (ej. ResumenDashboard)
};
