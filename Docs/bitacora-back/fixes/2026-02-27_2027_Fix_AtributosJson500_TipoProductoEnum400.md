# 2026-02-27_2027 — Fix: Atributos 500 + TipoProducto Enum 400

**Tags:** `#Modulo_Catalogo` `#Modulo_Ajustes` `#BugFix` `#Area_Backend` `#Importancia_Alta`

---

## 1. Fecha y Hora
**27/02/2026 — 20:27 (UTC-3)**

## 2. Tipo de Cambio
**BugFix × 2** — Error 500 al obtener atributos + Error 400 al crear producto con TipoProducto como string

---

## 3. Bugs y Soluciones

### Fix 1 — GET /api/ajustes/atributos → 500 Internal Server Error

**Síntoma:**
```json
{
  "mensaje": "Ocurrió un error interno en el servidor.",
  "detalle": "The input does not contain any JSON tokens. Expected the input to start with a valid JSON token, when isFinalBlock is true."
}
```

**Causa raíz:**  
La migración `AddAtributosJsonYConfiguracionAtributos` agrega la columna `ConfiguracionAtributosJson` a la tabla `Inquilinos`, pero los registros **existentes** quedan con valor `NULL` o `""` (string vacío) — no con el default `"{}"`. Al intentar deserializar un string vacío con `System.Text.Json`, el deserializador lanza excepción.

**Archivos modificados:**
- `Application/Features/Ajustes/Queries/ObtenerConfiguracionAtributosQuery.cs`

**Cambio:**
```diff
- var atributos = JsonSerializer.Deserialize<...>(inquilino.ConfiguracionAtributosJson, ...);
+ var json = inquilino.ConfiguracionAtributosJson;
+ if (string.IsNullOrWhiteSpace(json) || json.Trim() == "{}")
+     return new ConfiguracionAtributosDto { AtributosPorTipo = new() };
+ var atributos = JsonSerializer.Deserialize<...>(json, ...);
```

**Lección:** Siempre agregar guard de null/vacío antes de deserializar campos JSON que vienen de la BD, especialmente cuando son columnas nuevas que no tienen un `UPDATE` de retrocompatibilidad post-migración.

---

### Fix 2 — POST /api/catalogo/productos/matrix → 400 en tipoProducto

**Síntoma:**
```json
{
  "errors": {
    "$.tipoProducto": [
      "The JSON value could not be converted to Core.Enums.TipoProducto."
    ]
  }
}
```

**Causa raíz:**  
`TipoProducto` es un `enum` de C#. Por defecto, `System.Text.Json` serializa enums como **enteros** (`0`, `1`, `2`...). El frontend enviaba el valor como string (`"Ropa"`, `"Calzado"`...) porque en TypeScript la variable `tipoProducto` es de tipo `string`. El deserializador del backend no sabía convertir `"Ropa"` a `TipoProducto.Ropa`.

**Archivos modificados:**
- `API/Program.cs`

**Cambio:**
```diff
- builder.Services.AddControllers();
+ builder.Services.AddControllers()
+     .AddJsonOptions(opts =>
+     {
+         opts.JsonSerializerOptions.Converters.Add(
+             new System.Text.Json.Serialization.JsonStringEnumConverter()
+         );
+     });
```

**Efecto:**  
Ahora tanto `"Ropa"` como `0` son válidos para deserializar `TipoProducto.Ropa`. El frontend puede enviar el nombre del enum como string sin necesidad de convertirlo a entero. Esto aplica globalmente a todos los enums de la API.

**Lección:** Al agregar enums al modelo y al DTO, agregar `JsonStringEnumConverter` es casi siempre la decisión correcta para la interoperabilidad con frontends JavaScript/TypeScript.

---

## 4. Impacto en Multi-tenancy
- Ninguno directo. El Fix 1 es en la lectura de configuración por tenant y ya estaba correctamente filtrada por `TenantId`. El Fix 2 es de deserialización global, no afecta el aislamiento de datos.

---

## 5. Explicación Didáctica

### ¿Por qué la migración no llena las filas viejas?
> EF Core genera las migraciones con `AddColumn`, que en PostgreSQL agrega la columna con `NULL` en todos los registros existentes, aunque el entity tenga `= "{}"` como default en C#. Ese default solo aplica a los registros **nuevos**. La migración debería haber incluido un `UPDATE Inquilinos SET "ConfiguracionAtributosJson" = '{}' WHERE "ConfiguracionAtributosJson" IS NULL`.  
> La solución defensiva (guard de null) es más robusta porque funciona aunque alguien inserte un registro directamente en la BD sin pasar por EF.

### ¿Por qué los enums de C# son enteros por defecto?
> En C#, un `enum` es azúcar sintáctico sobre un `int`. `TipoProducto.Ropa` es internamente `0`. `System.Text.Json`, al serializar, convierte `0` a `0` (no a `"Ropa"`). El `JsonStringEnumConverter` le dice al serializador: "cuando veas `TipoProducto`, usá el nombre en texto, no el número". Esto hace la API más legible y robusta frente a refactorizaciones del orden del enum.
