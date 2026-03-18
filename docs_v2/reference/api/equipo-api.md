---
title: "Referencia de API: Equipo y Colaboradores"
description: Gestión de usuarios del staff, permisos, auditoría y acceso rápido por PIN.
status: stable
globs: ["backend/src/Application/Features/Equipo/**/*", "frontend/src/features/equipo/api/*"]
---

# Gestión de Equipo y Staff

Este módulo permite al Dueño del negocio gestionar a sus empleados, sus permisos de acceso y monitorear sus acciones en el sistema.

## 📡 Endpoints

### 1. Obtener Lista del Equipo
Recupera todos los colaboradores asociados al inquilino.

- **URL:** `GET /api/equipo`
- **Auth:** Requerido (Solo `Owner`)
- **Respuesta:** `ColaboradorDto[]`

### 2. Alta de Colaborador
Crea un nuevo usuario (Cajero, Admin, etc.) dentro del equipo.

- **URL:** `POST /api/equipo`
- **Auth:** Requerido (Solo `Owner`)
- **Body (`CrearColaboradorRequest`)**:
```typescript
interface CrearColaboradorRequest {
  email: string;
  nombre: string;
  password?: string; // Opcional si se usa solo PIN
  rol: number;       // ID del SystemRole
}
```

### 3. Gestión de Permisos y PIN
Configura qué módulos puede ver el empleado y su clave de acceso rápido para la tablet del mostrador.

- **URL:** `PUT /api/equipo/{id}/permisos`: Actualiza el array de permisos granulares.
- **URL:** `PUT /api/equipo/{id}/pin`: Cambia el PIN de 4 dígitos.

### 4. Acceso Rápido (Switch User)
Permite cambiar de usuario instantáneamente en la pantalla del POS mediante el ingreso del PIN, de modo que un vendedor puede "tomar la tablet" sin cerrar la sesión del inquilino.

- **URL:** `POST /api/equipo/acceso-rapido`
- **Payload**: `string` (El PIN de 4 dígitos).
- **Respuesta**: Nuevo JWT con los Claims del usuario que ingresó el PIN.

---

## 🏛️ Auditoría
El endpoint `GET /api/equipo/auditoria` permite al Dueño revisar el historial de acciones críticas (ej: eliminaciones, cambios de precio, aperturas de caja) realizadas por los diferentes miembros del staff.
