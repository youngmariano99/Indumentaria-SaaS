# Fix: Restricciones de Stock y Refinamiento de Devoluciones

- **Fecha y Hora:** 2026-03-03 18:30
- **Tipo de Cambio:** BugFix / Regla de Negocio
- **Módulo:** #Modulo_POS #Modulo_Ventas
- **Área:** #Area_Frontend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción del Problema
1.  **Venta sin Stock**: El POS permitía vender prendas aunque el stock figurara en 0, lo que generaba inconsistencias físicas.
2.  **Devoluciones Manuales**: Los vendedores podían agregar devoluciones "a mano" desde el catálogo, lo que permitía errores al no tener un ticket de referencia real.

## Detalle Técnico
1.  **Validación de Stock (POS)**:
    - Se agregaron chequeos en `agregarVarianteAlCarrito` para impedir la selección de items con stock 0.
    - Se implementaron alertas visuales cuando se intenta exceder el stock disponible.
2.  **Flujo de Devoluciones**:
    - Se eliminó el botón "+ Devuelve" del catálogo en `DevolucionesPage`.
    - Ahora el sistema obliga a que las devoluciones partan del historial de compras del cliente.
    - Se agregó el check "Ver todas las ventas" para facilitar la búsqueda de transacciones antiguas.
3.  **UI de Cambios**: Se deshabilitan las opciones de talle/color que no tienen stock cuando el cliente está eligiendo qué prenda llevarse a cambio.

## Explicación Didáctica
1.  **Caja Registradora Inteligente**: Ahora, si intentás pasar una prenda que no tenés en el estante, la computadora te avisa y no te deja cobrarla. Evitamos vender "humo".
2.  **Filtro de Seguridad**: Para devolver algo, ahora el sistema te pide "el ticket" (el historial). No se puede devolver cualquier cosa al azar; tiene que haber sido comprado previamente por ese cliente.

Archivos clave:
- `PosPage.tsx`: Bloqueo de venta sin stock.
- `DevolucionesPage.tsx`: Refinamiento del flujo de retorno y exchanges.
