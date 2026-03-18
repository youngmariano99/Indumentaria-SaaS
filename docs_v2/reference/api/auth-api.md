---
title: "Referencia de API: Autenticación (Auth)"
description: Endpoints de inicio de sesión, registro de administradores y gestión de identidad multi-tenant.
status: stable
globs: ["backend/src/API/Controllers/AuthController.cs", "frontend/src/features/auth/api/*"]
---

# Autenticación y Gestión de Identidad

Este módulo es la puerta de entrada al sistema y resuelve el aislamiento inicial de inquilinos (Tenants).

## 📡 Endpoints

### 1. Inicio de Sesión (Login)
Autentica a un usuario dentro de un subdominio específico.

- **URL:** `POST /api/auth/login`
- **Auth:** `AllowAnonymous`
- **Payload (`LoginRequest`)**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
  subdominio: string; // Identificador del local/empresa
}
```
- **Respuesta (`LoginResponse`)**: Retorna el JWT y metadatos del Rubro (Diccionario, Esquema).

### 2. Registro Temporal de Administrador (Onboarding)
Permite crear un nuevo Inquilino y su primer usuario con rol `Owner`.

- **URL:** `POST /api/auth/register-admin-temp`
- **Auth:** `AllowAnonymous`
- **Payload (`RegisterRequest`)**:
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  subdominio: string;
  nombreComercial: string;
  rubroId?: string; // UUID (Opcional, busca 'Indumentaria' por defecto)
}
```

---

## 🔒 Mecanismos de Seguridad

1.  **Aislamiento de Login**: El sistema busca al usuario **exclusivamente** dentro del inquilino resuelto por el subdominio.
2.  **Soberanía Criptográfica**: Las contraseñas se hashean mediante `BCrypt` antes de persistirse.
3.  **Claims del JWT**: El token generado contiene:
    - `UserId`: ID único del usuario.
    - `TenantId`: ID del inquilino (utilizado por el middleware RLS).
    - `Role`: Rol del sistema (Owner, Admin, Cashier).
