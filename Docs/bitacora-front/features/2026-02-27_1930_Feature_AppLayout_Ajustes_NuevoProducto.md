# 2026-02-27_1930 — Feature: Sprint 3.2 — AppLayout, AjustesPage, NuevoProductoPage Flexible

**Tags:** `#Modulo_Catalogo` `#Modulo_Ajustes` `#Modulo_Layout` `#Importancia_Alta` `#Area_Frontend`

---

## 1. Fecha y Hora
**27/02/2026 — 19:30 (UTC-3)**

## 2. Tipo de Cambio
**Nueva Función / Refactor** — Layout global compartido, página de ajustes con editor de talles y atributos, formulario de carga más flexible.

---

## 3. Resumen de Cambios

### 3.1 — AppLayout y Router Refactor
**Problema:** El sidebar/nav estaba duplicado en cada página (DashboardPage, CatalogoPage). Si se cambiaba un link en uno, no se actualizaban los otros.

**Solución:**
- `components/layout/AppLayout.tsx`: componente que contiene sidebar, logo, nav y footer. El botón "Configuración" es un `NavLink` real a `/ajustes`.
- `components/layout/AppLayout.module.css`: estilos copiados del sidebar original sin cambios de diseño.
- `app/router.tsx`: el `ProtectedLayout` es el guardián de autenticación que además envuelve todas las rutas en `AppLayout`. Los hijos se inyectan via `<Outlet />`.
- `features/dashboard/DashboardPage.tsx`: sidebar eliminado, solo queda header y contenido.
- `features/catalog/CatalogoPage.tsx`: sidebar eliminado.

### 3.2 — AjustesPage (Configuración)
**Ruta:** `/ajustes`  
**Archivo:** `features/ajustes/AjustesPage.tsx` + `AjustesPage.module.css`  
**API:** `features/ajustes/api/ajustesApi.ts`

**Funcionalidad:**
- Panel izquierdo para seleccionar tipo de producto (Ropa, Calzado, Accesorio, etc.).
- Editor de chips de talles: agregar, quitar, restaurar defaults del tipo.
- Sección de tabs: "Talles por tipo" (activo), "Mi cuenta" y "Notificaciones" (placeholders).
- Botón "Guardar cambios" con feedback de guardado/error.
- Al montar: carga la configuración del tenant via `GET /api/ajustes/talles`. Si vacía, usa los defaults de `tallesPorTipo.ts`.

### 3.3 — NuevoProductoPage Mejorado
**Archivo:** `features/catalog/NuevoProductoPage.tsx` + `NuevoProductoPage.module.css`

**Cambios en esta iteración:**
| Cambio | Detalle |
|---|---|
| Selector de tipo | Pre-carga talles y atributos según tipo de producto |
| Temporada opcional | Primer opción = "Sin temporada asignada" (vacío) |
| Botón eliminar fila 🗑️ | Cada fila tiene un Trash button para borrar la combinación |
| Atributos adicionales | Sección con pares Clave/Valor, editables, con defaults del tenant |
| Atributos pre-cargados | Al cambiar tipo, se consulta `GET /api/ajustes/atributos` |

**Nuevas clases CSS:**
- `.deleteRowBtn` → botón rojo hover, visible por row
- `.tableRow` → position relative para el botón
- `.atributoRow`, `.atributoInput`, `.atributoSep`, `.addAtributoBtn` → editor de atributos

### 3.4 — types/index.ts
- `VarianteDto.atributos: Record<string, string>` — para enviar atributos al backend.
- `AtributoKV` — tipo interno para el editor de atributos en el formulario.
- `CrearProductoDto.temporada` — documetado como puede ser vacío.

---

## 4. Lógica de pre-carga de atributos
```
Al montar NuevoProductoPage:
  → GET /api/ajustes/atributos
  → Si hay defaults para Ropa (tipo inicial), setAtributos(defaults)
  → Si falla: atributos = []

Al cambiar TipoProducto:
  → GET /api/ajustes/talles → pre-carga talles
  → GET /api/ajustes/atributos → pre-carga atributos del tipo nuevo
  → Si falla: no cambia lo que ya había
```

---

## 5. Flujo de variantes flexible
```
1. Usuario elige Calzado → talles 38-45 pre-cargados
2. Agrega colores: Negro, Azul
3. Tabla genera 16 filas (8 talles × 2 colores)
4. Usuario borra filas de Azul que no tiene: quedan 8+3 = 11 variantes
5. Agrega atributo Uso: F11
6. Guarda → 11 variantes con AtributosJson = {"Uso":"F11"}
```

---

## 6. Explicación Didáctica

### ¿Por qué Outlet en el Router?
> Antes de `Outlet`, cada página era como un cuarto decorado de cero — misma puerta, mismas ventanas. Con `Outlet`, el corredor (AppLayout) está fijo y cada cuarto solo pone sus muebles dentro.

### ¿Por qué Atributos como JSON y no columnas?
> Las variantes de ropa, calzado y accesorios necesitan datos muy distintos entre ellas. Si agregaras una columna por cada posible atributo, la tabla tendría 50 columnas vacías. El JSON es como un cajón donde cada variante guarda lo que le corresponde, sin molestar a las demás.

### ¿Por qué pre-cargar desde el backend y no hardcodear?
> Los talles y atributos varían por negocio: un local mayorista de Calzado tiene talles del 28 al 50; un local boutique del 36 al 42. Al cargar desde `/api/ajustes`, cada tenant ve su propia configuración. El código no cambia — cambia el dato.
