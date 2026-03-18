---
title: "Referencia de API: Arqueo de Caja"
description: Gestión del ciclo de vida de la caja (Apertura, Movimientos, Cierre).
status: stable
globs: ["backend/src/Application/Features/Arqueo/**/*", "frontend/src/features/pos/api/arqueoCajaApi.ts"]
---

# Arqueo y Control de Caja

Este módulo garantiza la integridad del efectivo y valores en cada punto de venta, permitiendo auditorías diarias por sucursal.

## 📡 Endpoints

### 1. Obtener Arqueo Actual
Recupera la caja abierta para la sucursal activa.

- **URL:** `GET /api/arqueocaja/actual/{storeId}`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `ArqueoDto` o `404` si la caja está cerrada.

### 2. Apertura de Caja
Inicia un nuevo turno de caja con un monto inicial (Fondo de caja).

- **URL:** `POST /api/arqueocaja/abrir`
- **Body (`AbrirCajaDto`)**:
```typescript
interface AbrirCajaDto {
  sucursalId: string;
  montoInicial: number;
}
```

### 3. Cierre de Caja
Finaliza el turno de caja registrando el monto final contado y calculando la diferencia (Sobrante/Faltante).

- **URL:** `POST /api/arqueocaja/cerrar/{id}`
- **Body (`CerrarCajaDto`)**:
```typescript
interface CerrarCajaDto {
  montoFinalReal: number;
  observaciones?: string;
}
```

### 4. Historial de Cierres
Permite auditar los cierres de caja pasados de una sucursal.

- **URL:** `GET /api/arqueocaja/historial/{storeId}?page=1&pageSize=10`

---

## 🏛️ Lógica de Control
El sistema calcula el **Saldo Teórico** sumando el monto inicial más todas las ventas en efectivo registradas en el POS. Al cerrar, el cajero debe ingresar el **Saldo Real** (contado). Si hay una diferencia importante, se genera un log de auditoría automático.
