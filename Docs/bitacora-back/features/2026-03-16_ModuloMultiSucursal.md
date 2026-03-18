# Feature: Módulo Multi-Sucursal (Backend)

**Fecha:** 16 de Marzo, 2026
**Autor:** Antigravity

## Descripción
Implementación del núcleo de gestión para múltiples sucursales, permitiendo a los negocios (Tenants) administrar diferentes sedes físicas, depósitos y puntos de venta.

## Cambios Realizados

### 1. Modelo de Datos
- **Sucursal.cs**: Se añadió el campo `Telefono` para completar la información de contacto de cada sede.

### 2. Capa de Aplicación (Application)
- **SucursalDtos.cs**: Creación de DTOs para solicitudes de creación y actualización.
- **ObtenerSucursalesQuery.cs**: Query con filtrado por Tenant para listar sucursales.
- **CrearSucursalCommand.cs**: Implementación de lógica de negocio para la creación.
    - Se incluyó validación de límite: 1 sucursal gratuita por defecto.
    - Requiere la feature `Multisucursal` habilitada para agregar una segunda sede.
- **ActualizarSucursalCommand.cs**: Gestión de actualización de datos de sede.
- **EliminarSucursalCommand.cs**: Eliminación física de sucursales con validación de seguridad (no permite eliminar la última sucursal).

### 3. API (Controllers)
- **SucursalesController.cs**: Nuevo controlador que expone operaciones CRUD protegidas por el rol `Owner`.

## Impacto en la Arquitectura
- Se refuerza el patrón de multi-tenancy mediante el uso de `IMustHaveTenant` y Global Query Filters.
- Se integra el `IFeatureResolver` en comandos de creación para implementar reglas de negocio delegadas (límites comerciales).
