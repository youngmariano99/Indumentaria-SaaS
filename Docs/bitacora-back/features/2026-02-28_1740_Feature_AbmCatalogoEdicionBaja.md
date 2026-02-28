# Bitácora Back-End: ABM Catálogo Completo (Edición y Baja Lógica)

**Fecha y Hora:** 2026-02-28 17:40
**Tipo de Cambio:** Nueva Función / Refactor
**Módulo:** Catálogo
**Tags:** #Modulo_Catalogo, #Area_Backend, #Importancia_Alta

## Impacto en Multi-tenancy
Los nuevos Endpoints y Comandos (`EditarProductoCommand`, `EliminarProductoCommand`) heredan la protección global del sistema. Todas las consultas filtradas o manipuladas interactúan con Entity Framework, bloqueando de raíz que un Tenant mutile o modifique productos de otra empresa gracias al Global Query Filter de `TenantId`.

## Detalle Técnico
1. **Soft Delete (`ISoftDelete`):**
   - Se aplicó la interfaz `ISoftDelete` a las entidades Core `Producto` y `VarianteProducto` añadiendo la propiedad booleana `IsDeleted`.
   - Se configuró el Interceptor en Infraestructura para que, al remover (`Remove()`) una entidad `ISoftDelete`, cambie su estado a `Modified` y ponga `IsDeleted = true`.
   - Se ancló un Global Query Filter en el `ApplicationDbContext` que previene hacer selects de entidades borradas lógicamente (`p => !p.IsDeleted`).

2. **Capa de Aplicación (CQRS):**
   - `EliminarProductoCommand`: Al recibir un `id`, busca al producto padre y, al borrarlo, se aplica la baja en cascada.
   - `EditarProductoCommand`: Modifica únicamente variables seguras del padre (Precio Base, Nombre, Desc), y actualiza recursivamente los atributos (`AtributosJson`), `PrecioCosto` y `PrecioOverride` en las clases hijas (Variantes) ya existentes comparando sus Ids.

3. **Capa API REST:**
   - Se publicaron los endpoints `PUT /api/productos/{id}` y `DELETE /api/productos/{id}` encapsulados en el `[Authorize]` nativo que procesa la firma JWT.

## Explicación Didáctica
- **¿Por qué "Baja lógica" y no borrar de una?**
Imaginá que un cliente te compró la "Remera Alien" la semana pasada, y vos hoy eliminás esa remera porque no la vendés más. Si usamos "Delete real" (Hard Delete), el historial de ventas del pasado colapsa al buscar una remera que ya no existe (Foreign Key error o pérdida de información valiosa). La 'Baja Lógica' es como "esconder en el depósito" la prenda. La UI no la muestra más, pero para el contador o la caja registradora vieja, sigue anotada en los papeles del pasado.

- **Comando de Edición Quirúrgica:**
El controlador PUT recibe un formulario gigante con Variantes incluidas. En lugar de borrar todo y recrearlo (que gastaría IDs nuevos), buscamos en base de datos la variante con la que hace match y solo le "pintamos" encima los cambios puntuales de precios especiales. Así cuidamos la integridad de los datos.
