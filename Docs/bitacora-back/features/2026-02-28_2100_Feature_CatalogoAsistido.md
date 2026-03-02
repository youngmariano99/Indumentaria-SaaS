#Modulo_Catalogo, #Area_Backend, #Nivel_Seguridad, #Catalogo_Asistido

## Fecha y Hora
2026-02-28 21:00

## Tipo de Cambio
Nueva Función (Catálogo asistido)

## Impacto en Multi-tenancy
- Todas las consultas de catálogo asistido reutilizan el `IApplicationDbContext` y sus filtros globales por `TenantId`, por lo que:
  - Un inquilino solo ve stock y ventas de sus propios productos.
  - Las agregaciones (stock total por producto, ventas de la semana) se ejecutan siempre acotadas al tenant activo.

## Detalle Técnico
- **DTOs** (`Application/DTOs/Catalog/CatalogoAsistidoDtos.cs`):
  - `ProductoStockResumenDto`: `ProductoId`, `Nombre`, `StockTotal`.
  - `ProductoVentaSemanaDto`: `ProductoId`, `Nombre`, `UnidadesVendidas`, `ImporteTotal`.

- **CQRS (MediatR)** (`Application/Features/Catalog/Queries/CatalogoAsistidoQueries.cs`):
  - `ObtenerProductosStockBajoQuery(umbral)`: calcula el stock total por producto (sumando inventarios de todas las variantes) y devuelve solo los productos con `0 < stockTotal < umbral`.
  - `ObtenerProductosSinStockQuery()`: mismo pipeline que el anterior, filtrando `stockTotal == 0`.
  - `ObtenerTopProductosSemanaQuery(topN)`: recorre `Ventas` y `VentasDetalles` de los últimos 7 días (excluyendo ventas anuladas), agrupa por `ProductoId` vía `VarianteProducto` y arma un ranking por unidades vendidas (y monto como criterio secundario).
  - Se factoriza la lógica de `stockPorProducto` en un método privado para reutilizarla en los dos primeros queries.

- **Controlador** (`API/Controllers/CatalogoAsistidoController.cs`):
  - `[GET] /api/catalogoasistido/stock-bajo?umbral=7` → `List<ProductoStockResumenDto>`.
  - `[GET] /api/catalogoasistido/sin-stock` → `List<ProductoStockResumenDto>`.
  - `[GET] /api/catalogoasistido/top-vendidos-semana?topN=3` → `List<ProductoVentaSemanaDto>`.
  - Todos los endpoints requieren autenticación (`[Authorize]`) y se apoyan en los filtros multi-tenant del contexto.

## Explicación Didáctica
- **¿Qué hace esto?**
  - Le da al sistema una “capa de inteligencia básica” sobre el catálogo: saber **qué productos están por quedarse sin stock**, cuáles **ya se agotaron**, y **cuáles son los más vendidos de la semana**, sin necesidad de planillas externas.
- **¿Cómo lo hace?**
  - Reutiliza las mismas tablas que ya existían:
    - `Inventarios` para el stock actual por variante, sumando todas las variantes de un producto.
    - `Ventas` + `VentasDetalles` para reconstruir cuántas unidades se vendieron en la última semana.
  - Desde el punto de vista del performance, se hace “el trabajo pesado” en el servidor con `GroupBy` de EF Core en lugar de traer todo al frontend.

