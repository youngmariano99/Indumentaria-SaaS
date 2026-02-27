# 2026-02-27_1930 — Feature: Sprint 3.2 Completo — Catálogo Avanzado, Ajustes y Flexibilidad del Formulario

**Tags:** `#Modulo_Catalogo` `#Modulo_Ajustes` `#Importancia_Alta` `#Area_Backend` `#Nivel_Seguridad_JWT`

---

## 1. Fecha y Hora
**27/02/2026 — 19:30 (UTC-3)**

## 2. Tipo de Cambio
- **Nueva Función × 5** — TipoProducto, Stock, AppLayout, Ajustes (Talles y Atributos), Formulario Flexible

---

## 3. Resumen de Cambios

### 3.1 — AppLayout Compartido (Refactor)
**Archivo:** `frontend/src/components/layout/AppLayout.tsx`  
**Motivo:** El sidebar estaba duplicado en cada página (Dashboard, Catálogo, etc.). Se extrajo a un componente compartido para garantizar consistencia y eliminar código repetido.

- Creado `AppLayout.tsx` con sidebar/nav idéntico al original. El botón "Configuración" pasó a ser un `NavLink` real a `/ajustes`.
- `DashboardPage.tsx` y `CatalogoPage.tsx` limpiados del sidebar embebido.
- `router.tsx` refactorizado con `ProtectedLayout` que envuelve todas las rutas autenticadas en `AppLayout`. Los hijos se renderizan via `<Outlet />`.

### 3.2 — TipoProducto y Stock Inicial

**Archivos clave:**
- `Core/Enums/TipoProducto.cs` — Enum con 6 tipos: Ropa, Calzado, Accesorio, RopaInterior, Deporte, RopaDeTrabajo.
- `Core/Entities/Producto.cs` — Campo `TipoProducto` (int → enum).
- `Application/Features/Catalog/Commands/CrearProductoConVariantesCommand.cs` — Mapea TipoProducto y crea registros en `Inventario` con `StockActual = stockInicial`.
- `Infrastructure/Migrations/20260227211745_AddTipoProductoYStockInicial.cs` — Migración aplicada.

**Impacto en Multi-tenancy:** Los registros de `Inventario` y `VarianteProducto` heredan `TenantId` del producto padre. RLS ya vigente en `ApplicationDbContext`.

### 3.3 — Módulo Ajustes: Talles por Tipo

**Archivos clave:**
- `Core/Entities/Inquilino.cs` — Campo `ConfiguracionTallesJson` (string JSON).
- `Application/Features/Ajustes/Queries/ObtenerConfiguracionTallesQuery.cs`
- `Application/Features/Ajustes/Commands/ActualizarConfiguracionTallesCommand.cs`
- `API/Controllers/AjustesController.cs` — `GET /api/ajustes/talles`, `PUT /api/ajustes/talles`
- `Infrastructure/Migrations/20260227214327_AddConfiguracionTallesJson.cs` — Migración aplicada.
- `frontend/src/features/ajustes/AjustesPage.tsx` — Editor de chips de talles por tipo.
- `frontend/src/features/ajustes/api/ajustesApi.ts`

**Impacto en Multi-tenancy:** La configuración de talles es exclusiva por tenant (almacenada en `Inquilinos.ConfiguracionTallesJson`). Cada tenant ve y edita solo sus talles.

### 3.4 — Sprint 3.2 Parte 2: Formulario Flexible

**Archivos clave (backend):**
- `Core/Entities/VarianteProducto.cs` — Campo `AtributosJson` (string JSON, default `{}`).
- `Core/Entities/Inquilino.cs` — Campo `ConfiguracionAtributosJson` (string JSON, default `{}`).
- `Application/DTOs/Catalog/VarianteDto.cs` — Campo `Atributos: Dictionary<string,string>`.
- `Application/Features/Ajustes/Queries/ObtenerConfiguracionAtributosQuery.cs`
- `Application/Features/Ajustes/Commands/ActualizarConfiguracionAtributosCommand.cs`
- `API/Controllers/AjustesController.cs` — `GET /api/ajustes/atributos`, `PUT /api/ajustes/atributos`
- `Infrastructure/Migrations/20260227223230_AddAtributosJsonYConfiguracionAtributos.cs` — Migración aplicada.

**Archivos clave (frontend):**
- `features/catalog/NuevoProductoPage.tsx` — Temporada opcional, botón Trash por fila (elimina combinaciones no deseadas), sección "Atributos adicionales" con pares Clave/Valor pre-cargados por tipo.
- `features/catalog/NuevoProductoPage.module.css` — Clases `deleteRowBtn`, `atributoRow`, `atributoInput`, `atributoSep`, `addAtributoBtn`.
- `features/ajustes/api/ajustesApi.ts` — Métodos `obtenerAtributos()`, `guardarAtributos()`.
- `features/catalog/types/index.ts` — `VarianteDto.atributos`, `AtributoKV`.

---

## 4. Cambios en la BD (PostgreSQL)

| Migración | Tabla | Columna | Tipo |
|---|---|---|---|
| `AddTipoProductoYStockInicial` | `Productos` | `TipoProducto` | `integer` |
| `AddConfiguracionTallesJson` | `Inquilinos` | `ConfiguracionTallesJson` | `text` |
| `AddAtributosJsonYConfiguracionAtributos` | `VariantesProducto` | `AtributosJson` | `text` (JSON) |
| `AddAtributosJsonYConfiguracionAtributos` | `Inquilinos` | `ConfiguracionAtributosJson` | `text` (JSON) |

---

## 5. Impacto en Multi-tenancy
- ✅ Los campos JSON de Inquilino son aislados por tenant (cada tenant tiene su propia fila en `Inquilinos`).
- ✅ `AtributosJson` en `VarianteProducto` está protegido por el Global Query Filter de `TenantId` existente.
- ✅ Todos los endpoints de Ajustes usan `ITenantResolver` para determinar el `TenantId` del JWT.

---

## 6. Explicación Didáctica

### ¿Qué es el AppLayout?
> Imaginá que antes cada empleado de una tienda usaba un uniforme diferente. El `AppLayout` es el **uniforme estándar** que todos usan — el sidebar, el logo, el menú. Ahora todas las páginas usan el mismo "uniforme" sin repetir código.

### ¿Qué es el TipoProducto?
> Es como las "secciones" de un local: Ropa, Calzado, Accesorios. Cuando un empleado carga un "Botín de Fútbol", el sistema ya sabe que es `Calzado` y pre-carga los talles de calzado automáticamente (del 35 al 48) en lugar de los talles de ropa (XS, S, M...).

### ¿Qué son los Ajustes de Talles y Atributos?
> Cada local es diferente. Un local que vende solo fútbol quizás solo quiere los talles 38 a 45. En Ajustes, el dueño arma su propia lista. También puede definir que para "Calzado" siempre aparezca el atributo "Tipo de suelo" pre-completado. El sistema lo guarda como un JSON en la tabla del local (Inquilino) — como una lista de configuración personal.

### ¿Qué es AtributosJson en la variante?
> Cuando creás un "Botín Negro Talle 40", podés guardar datos extra como `{"Uso": "F11", "Material": "Cuero sintético"}`. Estos datos se guardan junto a la variante en la base de datos. No necesitás crear columnas nuevas en la tabla — el JSON es flexible como un formulario dinámico.

### ¿Por qué el botón Trash en la tabla?
> El sistema genera automáticamente todas las combinaciones: si elegís Negro y Azul con los talles 38 al 45, crea 16 filas. El botón 🗑️ te permite borrar los casos que no tenés — por ejemplo, del Azul solo tenés 41, 42 y 43: borrás las otras 5 filas del Azul sin romper las del Negro.
