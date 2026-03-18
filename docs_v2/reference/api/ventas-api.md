---
title: "Referencia de API: Ventas (POS y Transacciones)"
description: Ciclo de vida de la transacción, cobro en punto de venta, devoluciones y cuentas corrientes.
status: stable
globs: ["backend/src/Application/Features/Ventas/**/*", "frontend/src/features/pos/api/*"]
---

# Transacciones de Venta y Punto de Venta (POS)

Este módulo es el motor transaccional del sistema, integrando la venta directa, la gestión de deuda de clientes (Cuentas Corrientes) y el flujo de cambios/devoluciones.

## 📡 Endpoints

### 1. Punto de Venta (POS)
Pobla la grilla de productos táctil y el buscador rápido por SKU.

- **URL:** `GET /api/ventas/pos-grid`: Obtiene el catálogo offline del local.
- **URL:** `GET /api/ventas/buscar?t=remera`: Búsqueda específica optimizada.
- **URL:** `GET /api/ventas/metodos-pago`: Lista de formas de pago activas (Efectivo, Tarjeta, QR).

### 2. Procesar Cobro (Ticket)
Registra el cobro final, detrae stock y persiste la venta.

- **URL:** `POST /api/ventas/cobrar`
- **Body (`CobrarTicketDto`)**: Contiene los IDs de las variantes, cantidades y el método de pago seleccionado.
- **Respuesta**: UUID del ticket generado (`VentaId`).

### 3. Gestión de Devoluciones
Registra la devolución de una prenda y genera el crédito a favor en la cuenta del cliente (Módulo Billetera).

- **URL:** `POST /api/ventas/devolucion`
- **Body (`DevolucionDto`)**:
```typescript
interface DevolucionDto {
  ticketOriginalId?: string;
  items: Array<{ varianteId: string; cantidad: number }>;
  clienteId: string;
}
```

### 4. Pagos de Cuenta Corriente (Deuda)
Registra un pago manual de un cliente para cancelar parte de su deuda en el sistema.

- **URL:** `POST /api/ventas/pagar-deuda`
- **Body (`RegistrarPagoDto`)**: `clienteId`, `monto` y `notas`.

---

## 🔐 Integridad y Validaciones
1. **Precio de Servidor**: El backend ignora el precio enviado por el front si existe una diferencia material con los datos de DB.
2. **Stock Multi-Sede**: La venta detecta automáticamente la sucursal activa (`X-Sucursal-Id`) y descuenta exclusivamente el stock de esa sede.
3. **Idempotencia**: Se recomienda el uso de claves en Redis para prevenir la duplicación de tickets en entornos con latencia de red en el mostrador.
