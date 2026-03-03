# Bitácora de Desarrollo - Frontend

## Feature: Módulo de Reportes Financieros
**Fecha:** 2026-03-03
**Sprint:** 4.8

### Cambios Realizados
1.  **Nueva Página de Reportes**: Se implementó `ReportesPage.tsx` con un diseño premium y responsive.
2.  **Sistema de Toggles**: Se incluyó un selector para alternar entre:
    - **Modo Pulso**: Diseñado para el dueño que quiere ver rápidamente "cómo va el día". Incluye widgets de ventas totales, ticket promedio y stock crítico.
    - **Modo Corporativo**: Una vista tabular avanzada que clasifica los productos según su importancia (Clase A, B o C) y muestra la rentabilidad real.
3.  **Integración de API**: Creación de `reportsApi.ts` para conectar con los nuevos endpoints de inteligencia del backend.
4.  **UX Pulida**: Se activó el acceso directo en el Sidebar de `AppLayout` para que el módulo sea accesible de inmediato.

### Didáctica del Cambio
El objetivo del frontend es "Acelerar la decisión". No mostramos solo números; el Modo Corporativo te dice qué productos están "muertos" (Clase C) para que puedas liquidarlos, y el Modo Pulso te avisa qué comprar de nuevo (Stock Crítico) antes de perder ventas.
