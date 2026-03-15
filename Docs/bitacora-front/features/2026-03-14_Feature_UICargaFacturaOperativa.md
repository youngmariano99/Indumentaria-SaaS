# Feature: Autocompletado de Productos y Registro de Facturas con Stock

**Fecha:** 2026-03-14
**Tipo:** Feature
**Módulo:** Proveedores (UI)

## Descripción
Se ha transformado la página de carga de facturas de un formulario estático a una herramienta operativa de alto rendimiento. Se integró el buscador de catálogo y la persistencia real de datos.

## Cambios Realizados

### Frontend
1.  **CargaFacturaPage**:
    *   Implementación de autocompletado de productos mediante `Ctrl + Space` o búsqueda por texto en la descripción.
    *   Soporte para navegación por teclado mejorada (Enter para confirmar búsqueda, Esc para cerrar).
    *   Vinculación visual de productos linkeados al inventario (borde izquierdo distintivo).
    *   Carga dinámica de proveedores en el encabezado.
    *   Conexión completa del botón "Guardar" con el backend.
2.  **API Clients**:
    *   `catalogApi`: Agregado `autocompleteProducts`.
    *   `providersApi`: Agregado `recordInvoice`.
3.  **UI/UX**:
    *   Dropdown de resultados de búsqueda con coste actual y SKU.
    *   Estados de carga (`loadingSearch`) y avisos visuales.

## Atajos de Teclado Agregados
*   `Ctrl + Space`: Disparar búsqueda en catálogo.
*   `Enter`: Seleccionar primer resultado o confirmar línea.
*   `F10 / Click`: Guardar registro completo.
