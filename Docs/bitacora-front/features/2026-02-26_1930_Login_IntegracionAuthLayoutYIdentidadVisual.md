# Frontend — Login: integración con AuthLayout e identidad visual

**Tags:** `#Modulo_Auth`, `#Area_Frontend`, `#Refactor`, `#Identidad_Visual`

---

## Fecha y hora

- **Fecha:** 2026-02-26  
- **Hora:** 19:30 (aproximada — Argentina)

---

## Tipo de cambio

**Refactor** — Integración visual del login existente con el layout de dos columnas y el design system. **No se modificó la lógica de autenticación ni la integración con el backend.**

---

## Contexto: qué pasó y por qué no se rompió nada

El **LoginScreen** (creado en el Sprint 2.1, backend/auth con Mariano) es el componente que hace el login real: subdominio, email, contraseña, llamada a `authApi.login`, uso de `useAuthStore` y redirección a `/pos`. Ese flujo y esa integración con el backend **siguen igual**.

Lo que se cambió fue **solo la presentación**:

1. **Router:** Antes, la ruta `/login` renderizaba únicamente `<LoginScreen />`, por eso se veía la pantalla gris con el formulario básico. Ahora `/login` usa **AuthLayout** con **LoginScreen** como hijo: mismo componente de login, pero dentro del layout de dos columnas (formulario a la izquierda, panel con iconos a la derecha).

2. **LoginScreen:** Dejó de ser una “página completa” con su propio fondo gris y card centrada. Pasó a ser **solo el contenido del formulario** que se muestra dentro de la columna izquierda de AuthLayout. Se mantienen:
   - Campo subdominio (solo en localhost)
   - Email, contraseña
   - `authApi.login({ subdominio, email, password })`
   - `useAuthStore` (login con token)
   - Redirección a `/pos` tras login exitoso

3. **Estilos:** Se reemplazaron clases genéricas (Tailwind/gris) por el **design system** del doc de identidad visual: componentes `Input` y `Button`, variables CSS (colores, tipografía Inter/Montserrat), y estilos de `AuthPages.module.css`.

**Resumen:** Sigue siendo el mismo LoginScreen que conecta con el backend; solo cambió dónde se renderiza (dentro de AuthLayout) y cómo se ve (identidad visual). No se tocó backend ni contratos de API.

---

## Impacto en multi-tenancy

Ninguno. El login sigue resolviendo tenant por subdominio y enviando JWT con `tenantid`; el backend no fue modificado.

---

## Detalle técnico

### Archivos modificados

| Archivo | Cambio |
|--------|--------|
| `frontend/src/app/router.tsx` | Ruta `/login`: de `element: <LoginScreen />` a `element: <AuthLayout />` con `children: [{ index: true, element: <LoginScreen /> }]`. |
| `frontend/src/features/auth/components/LoginScreen.tsx` | Refactor: ya no renderiza página completa (sin `min-h-screen`, sin card centrada). Renderiza solo el contenido del form (marca, título, campos, botón, link a registro) usando `Input`, `Button` y `AuthPages.module.css`. Lógica de auth (subdominio, `authApi.login`, `useAuthStore`, redirect) sin cambios. |

### Archivos no modificados (sin impacto)

- Backend (API, AuthController, JWT, subdominios).
- `authApi`, `authStore`, tipos de login.
- Rutas `/registro`, `/pos`, `RequireAuth`.

---

## Referencias

- `Docs/bitacora-back/features/2026-02-25_1300_Feature_Auth_y_Subdominios.md` — Origen del LoginScreen y flujo de auth.
- `Docs/bitacora-front/identidad_visual_y_mas.md` — Design system aplicado.
- `Docs/desarrollo/GuiaDesarrollo.md` — Formato de documentación.
