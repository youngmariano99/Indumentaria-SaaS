# Bitácora de Desarrollo - Métricas de Usuario en Dashboard

## Feature: Usuarios y Membresía Real
**Fecha:** 2026-03-03
**Sprint:** 4.10

### Cambios Realizados
1.  **Backend - Consolidación de Usuarios**:
    *   `IApplicationDbContext`: Se expusieron `Usuarios`, `LogsAuditoria` y `ModulosSuscripcion` para permitir consultas transversales.
    *   `ObtenerDashboardQuery`: 
        *   **Usuarios Registrados**: Conteo directo de la tabla de usuarios por inquilino.
        *   **Usuarios Activos**: Cálculo de IDs únicos en los logs de auditoría de las últimas 24 horas.
        *   **Membresía**: Cálculo de días restantes basado en la fecha de expiración más lejana de los módulos activos.
2.  **Frontend - Visualización**:
    *   `DashboardPage.tsx`: Se reemplazaron los placeholders de usuarios y días por los datos reales provenientes de la API.
    *   Limpieza de variables mock redundantes.

### Notas Técnicas
*   La definición de "Usuario Activo" se basa en la actividad (acciones registradas en auditoría), lo cual es más preciso que solo el último login.
*   Si no hay módulos de suscripción activos, el sistema muestra "0 días", lo cual sirve de alerta visual para el administrador.
