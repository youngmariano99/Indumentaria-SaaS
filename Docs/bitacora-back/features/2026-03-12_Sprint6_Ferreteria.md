# Feature: Inteligencia de Negocio y Arqueos (Ferretería)

**Fecha:** 2026-03-12
**Sprint:** 6 - Arqueos y Explotación Financiera

## Descripción
Se han implementado una serie de reportes y widgets especializados para el rubro ferretero, enfocados en la reposición de stock no estacional y la gestión de morosidad en cuentas corrientes.

## Cambios Realizados

### Backend
- **Reportes de Inventario:**
  - `ObtenerBajoStockQuery`: Identifica quiebres de stock basados en el `StockMinimo`.
  - `ObtenerValorizacionInventarioQuery`: Calcula el capital inmovilizado por categoría (Costo * Stock).
- **Reportes Financieros:**
  - `ObtenerAgingReportQuery`: Ranking de clientes morosos con antigüedad de deuda.
  - `ObtenerCajaFerreteriaQuery`: Desglose de ingresos diferenciando Ventas del Día de Cobranzas de Cuentas Corrientes.
- **API:** Nuevos endpoints en `ReportesController`.

### Frontend
- **Widgets Dinámicos:**
  - `CajaDetalleFerreteria`: Visualización con "separación dura" de flujos de fondos (Efectivo Ventas vs CC).
  - `AgingReport`: Tabla de morosidad con semáforo de criticidad (Crítico > 30 días).
  - `BajoStockFerreteria`: Panel de alertas naranja para reposición inmediata.
- **Dashboard:** Refactorización de `DashboardPage.tsx` para inyectar estos widgets mediante el `ComponentRegistry` solo cuando el rubro es "ferreteria".

## Impacto
- El rubro ferretería ahora tiene visibilidad clara de cuánto dinero entra por "ventas nuevas" vs "cobro de deudas", algo vital para su flujo de caja.
- Se facilita la reposición de mercadería crítica mediante el reporte de bajo stock.
