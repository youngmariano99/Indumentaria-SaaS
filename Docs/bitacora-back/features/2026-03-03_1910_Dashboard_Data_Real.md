# Bitácora de Desarrollo - Conexión de Dashboard

## Feature: Dashboard en Tiempo Real
**Fecha:** 2026-03-03
**Sprint:** 4.9

### Cambios Realizados
1.  **Backend - Inteligencia de Negocio**:
    *   Nuevo `DashboardDto` que unifica métricas de 4 áreas: Catálogo, Ventas (7 días), Finanzas (Hoy) y CRM (Cartera).
    *   `ObtenerDashboardQuery`: Implementa la lógica de agregación temporal para el gráfico de líneas (Últimos 7 días) y la consolidación de deuda de clientes.
2.  **Estandarización de Entidades**:
    *   Se agregó `CreatedAt` a `Producto`, `Cliente` y `Categoria`. Esto permite filtrar de forma nativa qué registros son "Nuevos" sin depender de tablas externas.
3.  **Frontend - Integración**:
    *   Se conectó `DashboardPage.tsx` con la API real.
    *   Se implementó un sistema de carga interactivo (`loading state`) y manejo de errores.
    *   Los colores de los métodos de pago ahora se mapean dinámicamente según el nombre devuelto por el servidor.

### Notas Técnicas
*   Se aplicó la migración `AddCreatedAtToEntities` para PostgreSQL.
*   El gráfico de ventas rellena automáticamente los días sin actividad con `$0` para mantener la escala visual de 7 días.
