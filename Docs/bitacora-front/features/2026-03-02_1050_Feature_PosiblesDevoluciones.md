# 2026-03-02 10:50 - Feature - Posibles Devoluciones y Mejoras en DevolucionesPage

**Fecha y Hora:** 2026-03-02 10:50
**Tipo de Cambio:** Nueva Función y Refactor
**Tags:** #Modulo_Ventas, #Importancia_Media, #Area_Frontend, #React

## Impacto en Multi-tenancy
No hay impacto directo. Las llamadas a las APIs (`posApi` y `clientesApi`) conservan en sus headers el token JWT ya configurado.

## Detalle Técnico
- **POS / Ventas (`PosPage.tsx`, `posApi.ts`):**
  - Se agregó una propiedad `posibleDevolucion` (type boolean) al estado `LineItem` del carrito.
  - Se agregó un `checkbox` por ítem debajo de la descripción en el carrito lateral y una función `togglePosibleDevolucion` para manejar su estado.
  - El flag se envía en `CobrarTicketDetalleDto` dentro de la llamada `posApi.cobrarTicket`.

- **Cambios y Devoluciones (`DevolucionesPage.tsx`):**
  - **Paginación:** Se implementó una paginación virtual en el catálogo de ropas con `slice()` de a 20 ítems (`PAGE_SIZE`), añadiendo botones Anterior/Siguiente para evitar el scroll infinito pesado.
  - **Buscador de Clientes:** Se reemplazó la clásica etiqueta `<select>` por un combo de búsqueda con `<input list="..."/>` + `<datalist>`, el cual mapea automáticamente el string (Nombre + Doc) hacia un `ClienteId`.
  - **Filtro del Historial:** Se agregó un Switch/Checkbox que por defecto muestra sólo aquellos ítems del historial del cliente marcados como "Posible Devolución". De no haber ninguno o si el cajero lo desea, puede marcar el checkbox para "Ver todas las ventas" y se desactiva el filtro, mostrando el top 15 de compras igual que antes.

## Explicación Didáctica
- **Objetivo:** Primero, permitir a la gente de ventas anotar si un producto se lleva para regalo u otra razón que lo haga propenso a volver. Segundo, mejorar la usabilidad de la pantalla de devoluciones.
- **Qué hicimos:**
  1. En el POS (*Punto de Venta*), le sumamos un botón pequeñito para tildar "Posible Devolución" a los ítems del carrito.
  2. En Devoluciones (*DevolucionesPage*), cambiamos el campo para buscar clientes por un buscador que se va autocompletando (más rápido que un select infinito).
  3. En vez de soltarte en la cara todo el catálogo de devoluciones (que tal vez tiene miles de prendas), ahora lo pasinamos de a 20.
  4. Por último, cuando eliges al cliente, solo te mostramos las compras recientes *que tenían la marquita de "Posible Devolución"*, para que sea rapidísimo. Si no hay nada o el cliente lo cambió por otra cosa, el usuario puede apretar un checkbox que muestra todo el historial normal.
