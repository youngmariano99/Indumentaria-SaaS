# Bitácora Front-End: Interfaz de Edición de Catálogo y Baja Lógica

**Fecha y Hora:** 2026-02-28 17:40
**Tipo de Cambio:** Nueva Función / Refactor
**Módulo:** Catálogo
**Tags:** #Modulo_Catalogo, #Area_Frontend, #React

## Impacto en Multi-tenancy
Los clientes Axios del frontend inyectan estáticamente el Token JWT, por lo tanto, cualquier petición PUT/DELETE forzada hacia otro catálogo rebotará en la capa de autorización del backend. A nivel UI, el usuario solo manipula los productos previamente decodificados como de su propiedad.

## Detalle Técnico
1. **API Client (`catalogApi.ts`):** 
   - Se sumaron las referencias a `editarProducto(id, data)`, `eliminarProducto(id)` y `obtenerProductoPorId(id)`.

2. **Componente `CatalogoPage` (Botonera de acciones):**
   - Injectado el icono `Trash` en las filas de la tabla principal y en el modal de resúmenes.
   - Vinculada una función de confirmación asincrónica (Aviso alertando sobre 'Ocultar producto') que gatilla el Soft Delete de backend y fuerza la auto-recarga del estado reactivo `setProductos(data)`.

3. **Componente `NuevoProductoPage` (Editor Dual):**
   - El router de React detecta si la ruta es `/catalogo/nuevo` (modo de alta) o `/catalogo/editar/:id` (modo mutación).
   - Haciendo uso del hook `useParams()`, lee el ID, hace Fetch al `catalogApi` y distribuye (map) la infomación preexistente en todos los Chips de estado y las grillas de variantes, para posibilitar una edición veloz, preservando el campo relacional "ID" de las variaciones.
   - El mismo botón principal discrimina lógicamente entre POST o PUT para cerrar la interacción.

## Explicación Didáctica
- **Modales con inteligencia dual:**
Al intentar mantener limpia la Interfaz, programamos que la misma pantalla que sirve para crear remeras nuevas, sirva para editar una existente. Esto es como tener una planilla de Excel vacía, a la cual, si le pasás un código en la solapa de arriba (URL ID), el Excel entra en tu computadora y automáticamente rellena cada renglón como estaba ayer para que solo le cambies la celda del "precio" y apliques los cambios sin re-tipear todo. 

- **Recarga Reactiva Post-Borrado:**
Cuando tocás el botón de la papelera para ocultar un Talle, la pantalla no "refresca usando F5 de navegador". React, en milisegundos, escucha la confirmación del servidor ("Ya lo borré loco") y mágicamente borra la fila local, garantizando que tengas feedback inmediato sin ver un parpadeo de pantalla blanca.
