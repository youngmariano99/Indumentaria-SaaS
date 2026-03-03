# Bitácora de Desarrollo - Backend

## Feature: Módulo de Reportes Financieros
**Fecha:** 2026-03-03
**Sprint:** 4.8

### Cambios Realizados
1.  **Entidad `VentaDetalle`**: Se agregaron los campos `CostoUnitarioAplicado`, `AlicuotaIvaPct` y `MontoIvaTotal`. Esto permite que el sistema mantenga una memoria financiera histórica que no se ve alterada por cambios futuros en el catálogo.
2.  **Lógica de Cobro (`CobrarTicketCommandHandler`)**: Se automatizó la captura del costo actual de la variante y el cálculo del desglose de IVA al momento de confirmar la transacción.
3.  **Reportes Controller**: Implementación de endpoints `/api/reportes/pulso-diario` y `/api/reportes/corporativo`.
4.  **Queries de Inteligencia (MediatR)**:
    - `ObtenerPulsoDiarioQuery`: Resumen de hoy (KPIs, medios de pago, ranking top 5).
    - `ObtenerReporteCorporativoQuery`: Análisis ABC (Pareto) y consolidado de rentabilidad basado en costos congelados.

### Didáctica del Cambio
Imagina que vendes una Remera a $1000 que te costó $500. El sistema guarda esos $500. Si la semana que viene la inflación hace que la misma remera te cueste $800, tus reportes del mes pasado seguirán diciendo que ganaste $500 en aquella venta, no $200. Esto es integridad contable.
