# 2026-02-27_2045 — Fix: Atributos no se muestran en VarianteResumen

**Tags:** `#Modulo_Catalogo` `#BugFix` `#Area_Backend` `#Importancia_Media`

---

## 1. Fecha y Hora
**27/02/2026 — 20:45 (UTC-3)**

## 2. Tipo de Cambio
**BugFix** — Los atributos extra (ej: "Material: Cuero", "Uso: F11") que se enviaban al crear el producto no se mostraban despues en el modal del catálogo.

---

## 3. Causa y Resolución

**Problema:**
1. El frontend enviaba el JSON con atributos al `POST /api/productos/matrix`.
2. El comando `CrearProductoConVariantesCommand` **SÍ** lo estaba serializando y guardando en `VariantesProducto.AtributosJson`.
3. Pero al consultar la API `GET /api/productos`, el catálogo mostraba "—" en la columna Atributos.

**Por qué:**
El DTO de respuesta `VarianteResumenDto`, usado por `ObtenerCatalogoQuery`, simplemente no tenía definida la propiedad `AtributosJson`. Por culpa de esto, cuando la query obtenía las variantes de la BD, esa columna se ignoraba y no viajaba en el JSON de respuesta.

**Fix aplicado:**
1. **Application/DTOs/Catalog/VarianteResumenDto.cs**:
   - `public string AtributosJson { get; set; } = string.Empty;`
2. **Application/Features/Catalog/Queries/ObtenerCatalogoQuery.cs**:
   - Se sumó `AtributosJson = v.AtributosJson` en la proyección LINQ.
3. **frontend/src/.../types/index.ts**:
   - A la interfaz `VarianteResumen` se le sumó `atributosJson?: string;`.
4. **frontend/.../CatalogoPage.tsx**:
   - Se limpió el parseo de atributos, eliminando un casteo riesgoso ya que ahora la propiedad es legalmente reconocida por TypeScript.

---

## 4. Impacto
- Ahora al hacer click en cualquier producto que se haya cargado con atributos (incluyendo los botines F11 creados antes), el modal del catálogo mostrará los chips verdes correspondientes en la columna "Atributos".
