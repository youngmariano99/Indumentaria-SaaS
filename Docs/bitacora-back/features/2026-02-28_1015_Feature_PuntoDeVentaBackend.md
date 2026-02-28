# Feature: Integración del Punto de Venta (Backend)
**Fecha y Hora:** 2026-02-28 10:15
**Tipo de Cambio:** Nueva Función
**Tags:** #Modulo_Ventas, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad_Alto

## Impacto en Multi-tenancy
Los nuevos endpoints de ventas (`GET /api/ventas/pos-grid` y `GET /api/ventas/metodos-pago`) y la funcionalidad de cobro (`POST /api/ventas/cobrar`) hacen uso estricto del Multi-Tenancy. Los clientes solo pueden ver las variantes y métodos de pago correspondientes a su propio Tenant debido a los Query Filters, y la entidad `Venta` junto con sus `VentaDetalles` aplican el tenant extraído de los claims automáticamente, asegurando aislamiento por RLS.

## Detalle Técnico
- Se agregaron las columnas `Subtotal`, `DescuentoGlobalPct`, `DescuentoMonto`, `RecargoGlobalPct` y `RecargoMonto` a la base de datos EF Core para la entidad `Venta` a través de la migración `AddDescuentosRecargosAVenta`.
- Creación de `ObtenerCatálogoParaPosQuery` devolviendo DTOs optimizados para la capa UI de punto de venta (evita overfetching).
- Creación de `ObtenerMetodosPagoQuery` que devuelve los métodos configurados (y añade "Efectivo", "Tarjeta de Débito", etc. si un tenant recién registrado no posee ninguno asignado).
- Adición de `CobrarTicketCommand` con re-cálculos puros en el servidor: `Venta.MontoTotal` es computado basándose en precios de la BD combinados con el "Porcentaje de descuento/recargo" enviado por el cajero en el Payload DTO, evitando que transacciones falsificadas desde el navegador se almacenen en DB. 

## Explicación Didáctica
- **El Punto de Venta no confía en nadie:** Imagina el POS del explorador web como si fuera un cliente dictándole los precios al cajero del supermercado; el cajero los escuchará, pero al final del día mirará el código de barras y la computadora dirá cuánto cobrar. Nuestro comando de Venta revisa la base de datos para ver si de verdad remera blanca cuesta $8000. Si el front dice "$200" pero el backend dice "$8000", deniega de raíz la transacción para que nadie estafe al negocio.
- **La magia de los Descuentos:** Anteriormente nuestra Venta solo pedía "Un total y ya está". Pero contablemente queríamos saber cuánto le regalamos a la gente. Con el reciente parche, el frontend nos envía el descuento base ("Un 10% OFF") y el backend calcula matemáticamente ese 10%, llenando las nuevas boletas o columnas de `DescuentoMonto` para los reportes de fin de año del contador.
