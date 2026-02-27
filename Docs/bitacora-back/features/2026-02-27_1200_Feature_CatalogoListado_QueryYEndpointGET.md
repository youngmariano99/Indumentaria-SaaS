# 2026-02-27_1200_Feature_CatalogoListado_QueryYEndpointGET.md
#Modulo_Catalogo, #Importancia_Alta, #Area_Backend, #CQRS

## Tipo de Cambio
Nueva Función — Endpoint `GET /api/productos` para listar el catálogo completo con variantes.

## Fecha y Hora
2026-02-27 12:00

## Impacto en Multi-tenancy
**Automático y garantizado.** El `ApplicationDbContext` tiene un global query filter que filtra por `TenantId` en todas las consultas. Esto significa que al llamar `_dbContext.Productos.ToListAsync()` dentro de `ObtenerCatalogoQueryHandler`, **PostgreSQL solo devuelve los productos del inquilino autenticado**. No hay ningún filtro manual necesario en el query handler — es el sistema de tenants quien lo aplica de forma transparente.

## Detalle Técnico

### Nuevos Artefactos

| Archivo | Tipo | Descripción |
|---|---|---|
| `Application/DTOs/Catalog/VarianteResumenDto.cs` | DTO de respuesta | Contrato de datos de una variante para el endpoint de listado: `Id, Talle, Color, SKU, PrecioCosto, PrecioOverride`. |
| `Application/DTOs/Catalog/ProductoConVariantesDto.cs` | DTO de respuesta | Contrato del producto padre con su lista de `VarianteResumenDto`: `Id, Nombre, Descripcion, PrecioBase, Temporada, Variantes[]`. |
| `Application/Features/Catalog/Queries/ObtenerCatalogoQuery.cs` | Query + Handler CQRS | Consulta todos los productos del tenant en 2 llamadas a la BD (una para productos, otra para variantes) y los combina en memoria. |

### Modificaciones

| Archivo | Cambio |
|---|---|
| `API/Controllers/ProductosController.cs` | Reemplazado el `GetProductoById` placeholder por el endpoint real. Agregado `GET /api/productos` (listado completo) y `GET /api/productos/{id}` (producto individual por ID). |

### Estrategia de Consulta: Anti N+1

El handler evita el problema de N+1 queries (hacer una query por cada producto para obtener sus variantes) con una estrategia en 2 pasos:

```
1. SELECT * FROM Productos WHERE TenantId = @tenant ORDER BY Nombre
2. SELECT * FROM VariantesProducto WHERE ProductId IN (@ids_del_paso_1)
3. Agrupar variantes en memoria con Dictionary<Guid, List<VarianteProducto>>
4. Proyectar al DTO combinando ambas colecciones
```

Esto resulta en exactamente 2 queries a PostgreSQL **sin importar cuántos productos tenga el catálogo**, en lugar de N+1.

### Bug Encontrado y Corregido
Al ordenar los productos se usó `.OrderByDescending(p => p.CreatedAt)` pero `Producto` hereda de `BaseEntity` (no de `AuditableEntity`), por lo que no tiene `CreatedAt`. Se corrigió a `.OrderBy(p => p.Nombre)` para orden alfabético consistente.

---

## Explicación Didáctica

### ¿Qué es el problema N+1 y por qué lo evitamos?

Imaginá que tenés 50 productos en el catálogo. Si por cada producto hacés una query para buscar sus variantes, estás haciendo **51 viajes a la base de datos** (1 para los productos + 50 para las variantes). Eso se llama el problema N+1.

Con la estrategia implementada hacemos siempre **exactamente 2 viajes**:
- Uno para traer todos los productos.
- Uno para traer todas las variantes de esos productos (usando `WHERE ProductId IN (...)`).

Después unimos los datos en la RAM del servidor. Para catálogos de cientos de productos, esta diferencia es dramática en velocidad.

### ¿Por qué el filtro de tenant no está en el código del query?

El filtro `WHERE TenantId = '...'` lo aplica automáticamente Entity Framework Core a través de los **Global Query Filters** configurados en el `ApplicationDbContext`. Es como si siempre hubiera un `WHERE` invisible que protege cada consulta. El desarrollador nunca lo puede olvidar por accidente — el sistema lo garantiza.
