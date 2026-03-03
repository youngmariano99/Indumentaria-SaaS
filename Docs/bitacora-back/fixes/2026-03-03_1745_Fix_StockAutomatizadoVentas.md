# Fix: Automatización de Stock en Ventas, Devoluciones y Cambios

- **Fecha y Hora:** 2026-03-03 17:45
- **Tipo de Cambio:** BugFix / Refinement
- **Módulo:** #Modulo_POS #Modulo_Ventas
- **Área:** #Area_Backend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción del Problema
Anteriormente, el sistema procesaba las transacciones financieras (Billetera, Métodos de Pago) correctamente, pero el stock de los productos permanecía estático. En una devolución, el cliente recibía saldo a favor pero la prenda no volvía al inventario disponible. En un cambio, el stock tampoco se ajustaba para la prenda nueva que se llevaba el cliente.

## Detalle Técnico
Se modificaron los Command Handlers del backend para integrar la gestión de inventario en tiempo real:

1.  **`CobrarTicketCommand`**: Al finalizar una venta exitosa, se localiza el registro de `Inventario` por variante y se resta la cantidad vendida.
2.  **`CrearDevolucionCommand`**:
    - **Fase Devolución**: Por cada ítem que el cliente deja, se incrementa el `StockActual` (+1).
    - **Fase Cambio**: Por cada ítem nuevo que el cliente se lleva, se decrementa el `StockActual` (-1).
3.  **Resiliencia**: Si por algún error operativo una variante no tiene registro de inventario inicial, el sistema crea uno automáticamente para permitir la transacción (evitando bloqueos en el punto de venta) y deja el stock negativo si es necesario para auditoría posterior.

## Explicación Didáctica
Imagina que el sistema es un bibliotecario que anota quién debe plata pero se olvidaba de mover los libros en los estantes.
- **Antes**: Si alguien devolvía un libro, el bibliotecario le devolvía la plata, pero dejaba el libro sobre el mostrador, nadie más podía llevárselo porque figuraba "prestado".
- **Ahora**: En cuanto el libro entra al local (Devolución), el bibliotecario lo pone de nuevo en el estante (+1 stock). Si el cliente se lleva otro libro (Cambio), el bibliotecario lo saca del estante (-1 stock). El inventario siempre coincide con lo que hay físicamente en el local.

Archivos clave:
- `CobrarTicketCommand.cs`: Descuento de stock en ventas.
- `CrearDevolucionCommand.cs`: Ajuste doble (entrada/salida) en cambios y devoluciones.
