---
title: "Referencia de API: Sucursales y Sedes"
description: Gestión de múltiples locales físicos, depósitos y su configuración geográfica.
status: stable
globs: ["backend/src/Application/Features/Sucursales/**/*", "frontend/src/features/sucursales/api/*"]
---

# Gestión de Sucursales (Multi-Sede)

Este módulo permite a negocios con crecimiento físico gestionar el stock y las cajas de forma independiente entre sus diferentes locales.

## 📡 Endpoints

### 1. Obtener Lista de Sucursales
Recupera todas las sedes del inquilino.

- **URL:** `GET /api/sucursales`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `SucursalDto[]`

### 2. Crear nueva Sucursal
Permite dar de alta una nueva sede física indicando nombre, dirección y contacto.

- **URL:** `POST /api/sucursales`
- **Auth:** Requerido (Solo `Owner`)
- **Body (`CrearSucursalRequest`)**:
```typescript
interface CrearSucursalRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
}
```

### 3. Modificación y Baja
Soporte para edición de datos o eliminación de sedes (siempre que no tengan stock activo o ventas pendientes).

- **URL:** `PUT /api/sucursales/{id}`
- **URL:** `DELETE /api/sucursales/{id}`

---

## 🏛️ Lógica de Aislamiento
Cuando un usuario inicia sesión, el frontend le solicita seleccionar una **Sucursal Activa**. El ID de esta sucursal se envía en el header `X-Sucursal-Id` en cada petición, permitiendo que el backend filtre automáticamente el stock y los reportes para esa sede específica.
