# Catálogo: Reparación de Binding de Categorías e Inventario Global In-Place

## 🎯 Objetivo de la Modificación
Reparar el módulo de Edición de Catálogo. Específicamente, el Frontend estaba perdiendo el contexto de la categoría previamente asignada (obligando a re-seleccionar) y limitaba la posibilidad de re-editar el Stock actual por desconexión en el CQRS (`EditarProductoCommand`).

## 🛠 Cambios Realizados

**1. Binding de `CategoriaId` en Consultas (Consultas y DTOs)**
- Faltaba inyectar en `ProductoConVariantesDto.cs` el property `CategoriaId` de tipo `Guid`.
- En `ObtenerCatalogoQuery.cs`, la proyección de LINQ se saltó el campo `p.CategoriaId`. Lo añadimos de retorno para que las grillas de front reciban todo.

**2. Soporte para Edición en Caliente de Stock (Commands y DTOs)**
- Agregamos `StockInicial` (de tipo entero) al `VarianteEdicionDto.cs`.
- Refactorizamos `EditarProductoCommand.cs`:
  - **Lógica Anterior:** Solamente pisaba `PrecioCosto`, `PrecioOverride` y `AtributosJson` (JSONb).
  - **Nueva Intercepción:** Busca mediante la inyección del `IApplicationDbContext` todos los `Inventarios` atados a los ID de Variantes (limitados bajo el identificador universal "Sucursal Matriz", es decir `StoreId == Guid.Empty`).
  - Iterando el payload introducido por el gerente actualiza el `StockActual`.
  - **Fallback:** En caso de que se haya corrompido un registro base de Inventario, lo auto-corrige e inserta on-the-fly (`_dbContext.Inventarios.Add(...)`).

## 🧠 Explicación Didáctica
Cuando un producto viaja del Backend al Frontend (GET), no solo importan sus caracteres para mostrar, sino las **Llaves Foráneas** (Foreign Keys). Un `select` de React (la lista desplegable de categorías de `NuevoProductoPage`) no lee el string "Remeras Blancas", lee el campo `value={categoriaId}`. Al estar vacío por parte del backend antiguo, la UI lo reseteaba a *Placeholder*, creyendo que no había categoría asignada.
Respecto al Inventario, la edición fallaba porque en la Base de Datos Relacional, el "Stock" **NO** está en la tabla estática "Producto", sino en la tabla viva "Inventario". Como el módulo de edición solo enfocaba en prender/apagar botones de Productos, el bloque completo de conexión al Inventario estaba invisible para su radar. Hubo que cruzar tablas en el paso 2 del comando para habilitar el guardado.
