# Integración Frontend - API REST (SaaS Indumentaria)
**Módulo:** Punto de Venta — POS Transaccional (Sprint 4)

Este documento define el contrato de datos, los endpoints disponibles y las recomendaciones de UX/UI para el desarrollador Frontend encargado de construir la pantalla de la Caja Registradora.

---

## 1. Patrón de Diseño Recomendado (UX/UI)

La pantalla del POS debe ser **táctil, rápida y operable con una sola mano**. Pensar en un cajero de local que tiene que atender 10 clientes por hora.

### Estructura Sugerida de la Pantalla

```
┌─────────────────────────────────────────────┐
│  Buscador de Productos (con nombre o SKU)   │
├───────────────────────┬─────────────────────┤
│                       │                     │
│   GRILLA DE PRODUCTOS │   TICKET ACTUAL     │
│   (cards táctiles)    │   ─────────────     │
│                       │   Remera L/Negro x2 │
│   [Remera S] [Rem M]  │   $25.000           │
│   [Jeans 38] [Jean40] │   Jeans 38/Azul x1  │
│                       │   $18.000           │
│                       │   ─────────────     │
│                       │   TOTAL: $68.000    │
│                       │   [COBRAR ▶]        │
└───────────────────────┴─────────────────────┘
```

**Recomendaciones clave:**
- La grilla de productos se carga desde `GET /api/ventas/pos-grid` al montar el componente y se guarda en un estado/contexto local. **No volver a pedirla en cada venta**.
- Al tocar una card de la grilla, abrir un mini-modal para seleccionar el **talle/color (variante)** y la **cantidad**.
- El "Ticket Actual" es estado local de React (array en memoria). Solo se envía al backend cuando el cajero toca **[COBRAR]**.
- Mostrar el botón de método de pago **antes** de enviar el cobro.

---

## 2. Contratos TypeScript (Interfaces)

Crear estas interfaces en `frontend/src/features/pos/types/index.ts`.

```typescript
// ──────────────────────────────────
// RESPUESTAS DEL SERVIDOR (GET)
// ──────────────────────────────────

export interface VariantePosDto {
  varianteId: string;         // UUID de la VarianteProducto
  sizeColor: string;          // Ej: "L / Negro"
  coeficienteStock: number;   // Stock disponible (0 = sin info aún)
}

export interface ProductoPosDto {
  id: string;                 // UUID del Producto padre
  nombre: string;             // Ej: "Remera Básica"
  precioBase: number;         // Precio de venta en pesos
  variantes: VariantePosDto[];
}

// ──────────────────────────────────
// PAYLOAD DE COBRO (POST)
// ──────────────────────────────────

export interface DetalleTicketDto {
  varianteProductoId: string;   // UUID de la variante seleccionada
  cantidad: number;             // Siempre > 0
  precioUnitarioDeclarado: number; // El precio que muestra la pantalla
}

export interface CobrarTicketDto {
  metodoPagoId: string;           // UUID del MetodoPago elegido
  montoTotalDeclarado: number;    // Suma de (cantidad * precio) del ticket local
  notas?: string;                 // Opcional: observaciones del cajero
  detalles: DetalleTicketDto[];   // Los ítems del ticket
}

// ──────────────────────────────────
// RESPUESTA AL COBRAR
// ──────────────────────────────────

export interface RespuestaCobro {
  ventaId: string;   // UUID de la Venta creada (para generar el recibo)
  mensaje: string;
}
```

---

## 3. Endpoints a Consumir

### `GET /api/ventas/pos-grid`
Carga el catálogo completo para poblar la grilla táctil.

- **Autenticación:** Bearer JWT (obligatorio).
- **Cuándo llamarlo:** Al montar el componente principal del POS. Guardar en estado global (Context o Zustand) para no repetir la llamada durante la sesión del cajero.
- **Respuesta:** Array de `ProductoPosDto[]`.

```typescript
// Ejemplo de uso con axios
const cargarCatalogoPOS = async (): Promise<ProductoPosDto[]> => {
  const { data } = await apiClient.get('/api/ventas/pos-grid');
  return data;
};
```

---

### `POST /api/ventas/cobrar`
Procesa el cobro de forma atómica.

- **Autenticación:** Bearer JWT (obligatorio).
- **Body:** Objeto `CobrarTicketDto`.
- **Respuesta exitosa:** `201 Created` con `{ ventaId, mensaje }`.
- **Respuesta de error:** `400 Bad Request` con detalle de validaciones.

```typescript
// Ejemplo de uso con axios
const procesarCobro = async (ticket: CobrarTicketDto): Promise<RespuestaCobro> => {
  const { data } = await apiClient.post('/api/ventas/cobrar', ticket);
  return data;
};
```

---

## 4. Flujo de Pantalla Recomendado (Paso a Paso)

```
1. Cajero abre la pantalla del POS
        ↓
2. Se dispara GET /api/ventas/pos-grid → guarda catálogo en estado local
        ↓
3. Cajero toca cards de la grilla, elige variante y cantidad
   → React va sumando ítems al array "ticketActual" en memoria (sin llamadas a la API)
        ↓
4. Cajero toca [COBRAR]
   → Mostrar modal para elegir el MetodoPago (lista hardcodeada o fetch futuro)
        ↓
5. Cajero confirma el método de pago
   → Armar el objeto CobrarTicketDto con todo el ticket
   → POST /api/ventas/cobrar
        ↓
6a. Respuesta 201 → Mostrar pantalla "Cobro exitoso 🎉" + opción de imprimir recibo
6b. Respuesta 400 → Mostrar toast de error con el mensaje del servidor
6c. Respuesta 500 → Mostrar "Error del servidor, intentá de nuevo" (no revelar detalles técnicos)
        ↓
7. Limpiar el ticketActual → volver al paso 3
```

---

## 5. Seguridad y Consideraciones Importantes

> [!IMPORTANT]
> **Los precios los decide el servidor, no el Frontend.** El campo `precioUnitarioDeclarado` que enviás en el payload es solo referencial para que el Backend pueda detectar si hay una discrepancia mayor a $1 (señal de manipulación). El precio **real** siempre se lee de la base de datos en el Handler. Si hay diferencia, la operación se rechaza con 400.

> [!NOTE]
> **El `montoTotalDeclarado` debe ser calculado por el Frontend** sumando `(cantidad * precioUnitarioDeclarado)` de cada ítem. Si el total que calculaste difiere del total que calcula el servidor con precios reales por más de $1, la venta se rechaza. Esto protege contra re-sincronización de precios desactualizada en el cache del Front.

> [!TIP]
> **Estrategia de cache del catálogo:** Si el dueño del local actualiza un precio en el panel de administración, el POS del cajero podría estar mostrando el precio viejo (del cache). La solución es agregar un botón `🔄 Actualizar catálogo` que dispare de nuevo el `GET /api/ventas/pos-grid`. No hace falta recargar toda la página.

---

## 6. MetodoPago: Cómo Obtenerlos

Por ahora la tabla `MetodosPago` se pobla manualmente desde la consola de PostgreSQL o desde el panel de admin. El `UUID` del método de pago es lo que hay que mandar en `metodoPagoId`.

**Valores de ejemplo para el ambiente de desarrollo (seedear en la BD):**
```sql
INSERT INTO "MetodosPago" ("Id", "TenantId", "Nombre", "Requiere Aprobacion", "Activo")
VALUES
  ('a0000001-0000-0000-0000-000000000001', '<TU_TENANT_ID>', 'Efectivo', false, true),
  ('a0000001-0000-0000-0000-000000000002', '<TU_TENANT_ID>', 'Tarjeta Débito', false, true),
  ('a0000001-0000-0000-0000-000000000003', '<TU_TENANT_ID>', 'Tarjeta Crédito', true, true),
  ('a0000001-0000-0000-0000-000000000004', '<TU_TENANT_ID>', 'Transferencia / QR', false, true);
```

En el Sprint futuro se creará el endpoint `GET /api/metodos-pago` para obtenerlos dinámicamente.
