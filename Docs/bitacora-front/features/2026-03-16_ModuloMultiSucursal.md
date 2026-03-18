# Feature: Módulo Multi-Sucursal (Frontend)

**Fecha:** 16 de Marzo, 2026
**Autor:** Antigravity

## Descripción
Implementación de la interfaz de usuario para la gestión de sucursales y la capacidad de alternar entre diferentes sedes mediante un selector global en el header.

## Cambios Realizados

### 1. Gestión de Estado y Comunicación
- **sucursalStore.ts**: Nuevo store de Zustand para manejar la sucursal seleccionada con persistencia en localStorage.
- **apiClient.ts**: Se actualizó el interceptor de peticiones para inyectar automáticamente el header `X-Sucursal-Id` en cada llamada al backend.
- **sucursalesApi.ts**: Definición de servicios para interactuar con los nuevos endpoints de sucursales.
- **useSucursales.ts**: Hook con React Query para gestionar el estado de carga y mutaciones de sucursales.

### 2. Componentes de UI
- **SucursalesConfig.tsx**: Componente para la pestaña de Ajustes que permite listar y gestionar sedes.
- **SucursalModal.tsx**: Interfaz para creación y edición de datos de sucursal.
- **SelectorSucursalHeader.tsx**: Selector dinámico integrado en el header global que permite el cambio rápido de contexto de trabajo.

### 3. Integración
- **AjustesPage.tsx**: Se añadió la nueva pestaña "Sucursales", visible únicamente para el rol Owner.
- **AppLayout.tsx**: Integración del selector de sucursal en el encabezado superior y rediseño ligero del header para incluir información del usuario y estado de conexión.

## Impacto en la Experiencia de Usuario
- El usuario ahora puede definir múltiples sedes y trabajar sobre una específica.
- La persistencia asegura que al recargar la página se mantenga en la última sucursal seleccionada.
- El filtrado de datos por sucursal es automático y transparente para los componentes gracias al interceptor de API.
