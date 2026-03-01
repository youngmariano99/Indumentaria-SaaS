---
Tags: #Modulo_CRM_Devoluciones, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad_Alto
---

# Feature: Gestión de Saldos, Deudas y Devoluciones

**Fecha y Hora:** 2026-03-01 18:00
**Tipo de Cambio:** Nueva Función

## Propósito
Completar el Sprint 4.2 del CRM, permitiendo que la tienda de Indumentaria registre devoluciones de mercadería, intercambios de productos (sale uno, entra uno) y maneje la cuenta corriente del cliente. Se buscó soportar saldos positivos (el cliente tiene dinero a favor) y saldos negativos (el cliente le debe al local).

## Impacto en Multi-tenancy
- Todas las consultas a `VariantesProducto`, `Productos` y `Clientes` respetan el `TenantId` del local logueado `IMustHaveTenant` para prevenir fugas de stock o cruces de saldo entre diferentes tiendas.
- Se asegura el borrado lógico (`ISoftDelete`) para que un cliente o producto no desaparezca de historiales contables.

## Detalle Técnico
1. **CQRS Saldo:** 
   - Refactor de `AgregarSaldoClienteCommand` y `DescontarSaldoClienteCommand`. Eliminamos la restricción bloqueante de `< 0` permitiendo asentar deudas.
2. **Endpoint POST `/api/Ventas/devolucion`:**
   - Vinculado al `CrearDevolucionCommand`. Este comando recibe variantes que vuelven a stock, y variantes que el cliente se lleva en parte de pago.
   - Computa las matemáticas de diferencia, impacta directamente al `.SaldoAFavor` del cliente conectado por `ClienteId` y graba los cambios en la Base de Datos PostgreSQL Neon utilizando transacciones.
3. **Optimización CRM (Perfil 360):**
   - Agregado del modelo `CompraRecienteDetalleDto` dentro de la consulta con Joins (`ObtenerCliente360Query`). 
   - Ahora Entity Framework busca en `VentaDetalle` y cruza con `VarianteProducto` y `Productos` para devolver qué talles y colores se llevó exactamente un usuario en sus últimas 10 ventas.

---

## Explicación Didáctica
Imaginemos que la cuenta corriente del cliente es una "billetera virtual" que el local guarda en sus registros.
Antes, la billetera solo podía tener $0 o dinero a favor. Ahora le dimos flexibilidad: puede "quedar en rojo", lo cual significa que le debe plata al almacén (Deuda).
A su vez, el comando de devoluciones funciona como una "balanza mágica". De un lado del platillo pones lo que el cliente te devuelve, y del otro lo que se lleva nuevo. La balanza resta el peso de ambas cosas, y si te sobra "plata", te la inyecta automáticamente en tu billetera. Si te falta, te lo anota como deuda. Y todo esto ocurre mientras repone en las estanterías el stock de las prendas devueltas.
