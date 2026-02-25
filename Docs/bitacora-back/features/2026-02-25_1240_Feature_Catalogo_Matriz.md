# Registro de Desarrollo - Catálogo y Matriz de Productos

**Fecha y Hora:** 2026-02-25 12:45
**Tipo de Cambio:** Nueva Función (Feature)
**Tags:** #Modulo_Catalogo, #Area_Backend, #Arquitectura_Matriz

## Impacto en Multi-tenancy
Los comandos creados (`CrearProductoConVariantesCommand`) inyectan `ITenantResolver` para obtener el ID del inquilino (local) autenticado. Se aplican los Global Query Filters y el `TenantSessionInterceptor` a nivel DbContext garantizando que al insertar productos o consultar sus variantes, se aíslen criptográficamente (Row Level Security lógico) del resto de tiendas en la base de datos compartida PostgreSQL.

## Detalle Técnico
- **Entity Framework Core:** Se modificó la entidad `VarianteProducto` añadiendo el campo financiero `PrecioCosto` (decimal). Se aplicó exitosamente la migración en PostgreSQL.
- **Inversión de Dependencias (Clean Architecture):** Se corrigió la fuga arquitectónica inyectando `IApplicationDbContext` en vez de referenciar directamente a la capa de Infraestructura (`ApplicationDbContext`), asegurando que la capa de reglas de negocio (`Application`) no dependa de implementaciones concretas de base de datos.
- **CQRS y Validaciones (MediatR + FluentValidation):** Se implementó un pipeline interceptor (`ValidationBehavior`) donde todo Payload enviado por HTTPS pasa a través de las reglas establecidas en `CrearProductoValidator` (p. ej., PreciosBase > 0, estructura cruzada de JSON), rebotando en automático con un StatusCode 400 *Bad Request* ante datos corruptos.

---

## Explicación Didáctica

### ¿Qué es lo que construimos acá y cómo funciona?

Imagínate que la Base de Datos es como un inmenso depósito de cajas, y el código backend que escribimos son los "empleados" que acomodan las cosas. 

1. **El Problema de los Talles (La Carga Matricial):** 
   En una tienda de ropa comercial normal, si te llega una remera "Nike" en 5 colores y 4 talles distintos (20 opciones totales), sería un infierno obligar al empleado a cargar 20 productos separados. Lo que hicimos fue enseñarle al backend a procesar una "Matriz". 
   El usuario desde el Frontend manda un solo paquete con: "Remera Nike - Colores: Azul,Rojo - Talles: S,M".
   Automáticamente, nuestro "empleado backend" multiplica esto mentalmente y guarda 1 "Entidad Padre" (la Remera Nike con su descripción general) y le cuelga por debajo 4 "Hijas Variantes" (S-Azul, S-Rojo, M-Azul, M-Rojo). Esto evita repetir información y hace que los reportes de facturación, a futuro, comprendan que todas esas variantes pertenecen a la "misma remera".

2. **Diferencia con el SKU Directo:**
   Si lo hubiéramos hecho con la metodología básica (SKU Directo o Plana), no habría "Padre" e "Hijas", habrían 4 productos distintos desconectados entre sí flotando en la base de datos. Cambiarle el nombre de "Nike" a "Nike Pro" significaría que el cliente deba editar minuciosamente 4 registros en lugar de solo editar al "Padre" y que las Hijas lo hereden automáticamente. Esta nueva estructura de Matriz copia a titanes como Amazon o Shopify y hace que la aplicación escale de forma profesional.

3. **CQRS y Pipeline de Seguridad (El Control de Calidad):**
   Implementamos herramental llamado *MediatR* y *FluentValidation*. Imagínatelo como un "Control de Seguridad en la entrada del Depósito". 
   Cuando alguien manda instrucciones (un JSON Payload) para crear una caja nueva, el guardia frena todo y revisa *(ValidationBehavior)*: 
   - "¿Le pusiste el Precio de Costo?" 
   - "¿Trataste de poner un talle vacío?"
   - "¿El precio base es negativo?"
   Si el papel está mal completado, le sella la orden con "DENEGADO" (Error 400 Bad Request) y lo devuelve antes de que el archivo toque la sagrada Base de Datos PostgreSQL. Así evitamos manchar la integridad de los datos del Tenant (Inquilino).
