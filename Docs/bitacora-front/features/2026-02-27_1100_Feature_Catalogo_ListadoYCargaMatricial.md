# Frontend — Catálogo: Módulo completo (Listado + Carga Matricial)

**Tags:** `#Modulo_Catalogo`, `#Area_Frontend`, `#Feature`, `#Integracion_API`, `#UX_Matricial`

---

## Fecha y hora

- **Fecha:** 2026-02-27
- **Hora:** 11:00 – 12:00 (Argentina)

---

## Tipo de cambio

**Nueva Función** — Módulo completo de Catálogo en el frontend. Incluye la visualización de productos en grilla de cards y el formulario de carga matricial conectados al backend real.

---

## Contexto: qué construimos y por qué

El catálogo existía completamente en el backend (endpoint `POST /api/productos/matrix`) pero no había ninguna pantalla en el frontend para ni crear ni ver productos. Este sprint construyó el módulo completo desde cero.

---

## Impacto en multi-tenancy

Ninguno adicional. El JWT en el header de cada petición le indica al backend el tenant del usuario logueado. El backend filtra los productos por tenant automáticamente antes de devolverlos. El frontend simplemente muestra lo que recibe.

---

## Detalle técnico

### Archivos nuevos

| Archivo | Qué hace |
|---|---|
| `features/catalog/types/index.ts` | Tipos TypeScript para payload de creación (`CrearProductoDto`, `VarianteDto`) y para respuesta del listado (`ProductoConVariantes`, `VarianteResumen`). También `FilaVariante` para el estado interno del formulario. |
| `features/catalog/api/catalogApi.ts` | Métodos `obtenerCatalogo()` (GET) y `crearProductoConVariantes()` (POST). El JWT lo inyecta automáticamente el interceptor del `apiClient`. |
| `features/catalog/CatalogoPage.tsx` + `.module.css` | Página de listado: fetch real al backend, estados de loading/error/empty, barra de estadísticas, grilla responsive de cards. Cada card muestra nombre, precio formateado, temporada y chips de variantes. |
| `features/catalog/NuevoProductoPage.tsx` + `.module.css` | Formulario de carga matricial: inputs de datos base + chips de talles y colores + generación reactiva de la tabla de variantes. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/router.tsx` | Rutas `/catalogo` y `/catalogo/nuevo` protegidas con `RequireAuth` (requieren JWT válido). |

### La Lógica Matricial (El corazón del formulario)

El generador de variantes funciona con un `useEffect` que escucha los arrays de `talles` y `colores`:

```
talles  = ["S", "M", "L"]
colores = ["Negro", "Azul"]

→ filas generadas automáticamente:
   S / Negro   M / Negro   L / Negro
   S / Azul    M / Azul    L / Azul
```

Si el usuario agrega un talle nuevo (`XL`), el `useEffect` corre de nuevo y agrega las filas faltantes **preservando los datos ya cargados** (SKU, costo, precio especial) en las filas existentes.

### Generación del subdominio en Registro

El campo de "Nombre del negocio" en el registro genera automáticamente el subdominio:
```typescript
const subdominio = nombreComercial.trim().toLowerCase().replace(/\s+/g, "-");
// "Mi Tienda Ropa" → "mi-tienda-ropa"
```

---

## Explicación Didáctica

### ¿Por qué chips en lugar de inputs individuales?

En un local de ropa, lo típico es querer cargar "S, M, L, XL, XXL" para una remera. Si el formulario fuera un campo de texto por cada talle, el cajero tendría que hacer click 5 veces solo para cargar los talles.

Con los chips, el flujo es: **escribís "S", Enter, "M", Enter, "L", Enter** — tres teclas por talle. Y la tabla de variantes se arma sola.

### ¿Qué hace el precio "override" de cada variante?

El `PrecioBase` es el precio general del producto (ej: $25.000). Pero si el talle XXL de esa remera costó más de materia prima, puede valer $28.000 — ese es el `PrecioOverride`. Si no se carga nada, el POS usará el `PrecioBase` al cobrar.

### El ciclo completo de vida de los datos

```
[Frontend] Carga formulario matricial
        ↓ POST /api/productos/matrix (payload con variantes)
[Backend] ObtenerCatalogoQuery
        ↓ Crea Producto + N VarianteProducto en transacción
[Base de datos] PostgreSQL persiste todo
        ↓
[Frontend] GET /api/productos al montar CatalogoPage
        ↓ Recibe ProductoConVariantes[]
[Pantalla] Grilla de cards con todos los productos del negocio
```

---

## Referencias

- `Docs/Integraciones/Front_Int_API_Catálogo-Matriz de Stock.md` — Contrato de datos y UX definidos previamente.
- `Docs/bitacora-back/features/2026-02-27_1200_Feature_CatalogoListado_QueryYEndpointGET.md` — Cambios en el backend para el endpoint GET.
- `Docs/bitacora-front/identidad_visual_y_mas.md` — Design system aplicado.
