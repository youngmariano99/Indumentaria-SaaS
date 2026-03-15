# Feature: Integración de Catálogo y Actualización de Stock en Facturación de Proveedores

**Fecha:** 2026-03-14
**Tipo:** Feature
**Módulo:** Proveedores / Inventario

## Descripción
Se ha implementado la conexión técnica entre el módulo de Proveedores y el Catálogo de Productos. Ahora, al cargar una factura de proveedor, el sistema permite seleccionar productos/variantes existentes, actualizando automáticamente su stock y sus costos de reposición.

## Cambios Realizados

### Backend
1.  **GetProductAutocompleteQuery**: Implementación de búsqueda rápida por nombre o SKU en `VariantesProducto` para alimentar el autocompletado del frontend.
2.  **RecordFacturaProveedorCommand**: Nuevo comando que:
    *   Registra la `FacturaProveedor`.
    *   Itera las líneas y, si están vinculadas a una `VarianteId`, incrementa el `StockActual` en la tabla `Inventarios`.
    *   Actualiza el `PrecioCosto` en la `VarianteProducto` basándose en el precio de la factura.
3.  **ProveedoresController**: Expuesto endpoint `POST /api/proveedores/factura` y `GET /api/productos/autocomplete`.

### Estructura y Arquitectura
*   Se mantiene la integridad multi-tenant mediante el uso de `ApplicationDbContext` y `ITenantResolver`.
*   La actualización de stock se realiza de forma atómica dentro de la transacción del registro de factura.

## Impacto
*   **Inventario**: Los niveles de stock ahora se reflejan automáticamente tras una compra.
*   **Costos**: El sistema mantiene el "Último Precio de Compra" actualizado para cálculos de rentabilidad futuros.
