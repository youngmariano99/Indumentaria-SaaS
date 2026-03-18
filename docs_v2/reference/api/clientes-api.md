---
title: "Referencia de API: Clientes (CRM)"
description: Gestión de clientes, cuentas corrientes, billetera digital y prendas en curso.
status: stable
globs: ["backend/src/Application/Features/CRM/**/*", "frontend/src/features/crm/api/*"]
---

# Gestión de Clientes (CRM)

Este módulo administra la relación con el cliente, sus deudas, créditos y el estado de sus trabajos/prendas en curso.

## 📡 Endpoints

### 1. Obtener Listado de Clientes
Recupera todos los clientes activos del inquilino (Tenant).

- **URL:** `GET /api/clientes`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `ClienteDto[]`

### 2. Perfil 360 de Cliente
Obtiene una vista consolidada del historial financiero del cliente, incluyendo sus ventas, saldos y prendas en curso en una sola respuesta.

- **URL:** `GET /api/clientes/{id}/perfil-360`
- **Auth:** Requerido
- **Respuesta:** `Cliente360Dto`

### 3. Gestión de Saldo (Billetera Digital)
Permite sumar o restar saldo a favor en la cuenta del cliente (ej: Devolución, Cobro manual).

- **URL:** `POST /api/clientes/{id}/saldo/sumar`
- **URL:** `POST /api/clientes/{id}/saldo/restar`
- **Body (`AgregarSaldoClienteCommand`)**:
```typescript
interface AgregarSaldoClienteCommand {
  monto: number;
  notas?: string; 
}
```

### 4. Prendas en Curso (Follow-up)
Administra los trabajos pendientes asociados al cliente (ej: Señas, Reservas de prendas específicas).

- **URL:** `POST /api/clientes/{id}/prendas-en-curso`
- **URL:** `PUT /api/clientes/prendas-en-curso/{prendaId}/estado`

---

## 🏛️ Lógica Financiera
El **Saldo a Favor** es una billetera digital interna. Si un cliente realiza una devolución, en lugar de manejar efectivo, se acredita un saldo en su perfil, el cual puede ser descontado posteriormente en el checkout de una venta (Módulo POS).
