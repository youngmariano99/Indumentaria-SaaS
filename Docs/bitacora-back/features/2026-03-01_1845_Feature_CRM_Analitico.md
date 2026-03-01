# Documentación de Funcionalidad: CRM Analítico y Query de Marketing

**Fecha y Hora:** 2026-03-01_18:45
**Tipo de Cambio:** Nueva Función
**Impacto en Multi-tenancy:** Los cálculos analíticos (Ventas, Variantes, Productos) se basan en el `tenant_id` subyacente gracias a los Global Query Filters de Entity Framework, manteniendo el estricto aislamiento de los datos en Postgres.

---

## Detalle Técnico

Se actualizaron los requerimientos para el Listado General de Clientes. Se necesitaba que la consulta devolviese tres métricas analíticas fundamentales para establecer perfiles de Marketing:
1. `TotalCompras` (Int)
2. `TotalGastado` (Decimal)
3. `CategoriaPreferida` (String basada en el Enum TipoProducto)

### Solución Arquitectónica
Se modificó fuertemente el handler `ObtenerClientesQueryHandler.cs` y su correspondiente DTO `ClienteDto`.
Para evitar incurrir en el clásico problema de *Select N+1* del ORM al calcular metadatos por cada cliente:

1. Se recuperan en una sola bajada rápida los Clientes con el conteo de Ventas y suma total de montos cruzando la tabla _Ventas_ desde la DB (vía `Select` puro en IQueryable).
2. Si existen clientes, se descargan **solo** los _DetallesVentas_ asociados a los IDs obtenidos y se extrae en memoria la matriz de Productos y Variantes en _Dictionaries_ de O(1).
3. En memoria RAM, utilizando LINQ to Objects (`GroupBy` y Diccionarios cruzados) se determina para cada cliente cuál fue el tipo de producto más comprado resolviéndolo instantáneamente y sin latencia transaccional.

---

## Explicación Didáctica
Imaginate que sos un profesor revisando los exámenes de 50 alumnos (que serían nuestros Clientes). 
En lugar de ir alumno por alumno, llamando a secretaría cada vez para preguntar "¿Qué notas tiene este chico en Lengua?" *(Eso sería el error N+1 en Base de Datos)*, lo que hicimos fue pedir de una sola vez **todas las libretas de la escuela**.

Luego, sentados en un escritorio amplio (que sería la _Memoria RAM del servidor_), cruzamos todos los datos de forma manual e instantánea agrupando por alumno. De esta forma, descubrimos rápidamente el "Monto Total" y el "Producto Favorito" de cada uno sin estresar a la secretaría del colegio (el motor Postgres). 
Esto nos permite devolverte una grilla de marketing ultra rápida.
