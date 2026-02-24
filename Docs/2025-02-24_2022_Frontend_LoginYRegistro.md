# Frontend — Login y registro (solo UI)

**Tags:** `#Modulo_Auth`, `#Area_Frontend`, `#Importancia_Alta`, `#Nivel_Seguridad_Pendiente`

---

## Fecha y hora

- **Fecha:** 2025-02-24  
- **Hora:** 20:22 (aproximada de realización — Argentina)

---

## Tipo de cambio

**Nueva Función** — Pantallas de inicio de sesión y registro del SaaS, solo interfaz (sin conexión al backend).

---

## Descripción breve

Se implementó el flujo de autenticación en el frontend (React + TypeScript + Vite): pantalla de **login**, pantalla de **registro** y una **pantalla placeholder** post-login. Se respetó la estructura de carpetas de `EstructuraFront.md`, los tokens y componentes del design system de `identidad_visual_y_mas.md`, y la filosofía de nomenclatura en español de `GuiaDesarrollo.md`. Por ahora no hay llamadas a API ni persistencia de sesión; está preparado para conectar luego con los endpoints del backend (JWT, TenantId, etc.).

---

## Impacto en multi-tenancy

- **Actual:** Ninguno a nivel de datos. No hay llamadas al backend ni uso de TenantId.
- **Futuro:** Cuando se conecte el backend, el login devolverá JWT (y eventualmente TenantId / Feature Flags). El registro deberá crear o asociar el usuario a un tenant; las pantallas ya dejan lugar a campos adicionales (ej. nombre comercial, CUIT) si el negocio lo requiere.

---

## Detalle técnico

### Dependencias nuevas (npm)

| Paquete                   | Versión  | Uso                                      |
|---------------------------|----------|------------------------------------------|
| `react-router-dom`        | ^7.6.1   | Rutas y navegación (login, registro, home). |
| `@phosphor-icons/react`    | ^2.1.7   | Iconografía según identidad visual.      |

### Cambios en base de datos

Ninguno. Solo frontend.

### Estructura de archivos creados o modificados

- **`frontend/package.json`** — Añadidas dependencias anteriores.
- **`frontend/index.html`** — `lang="es"`, título "POS Indumentaria".
- **`frontend/src/index.css`** — Import de variables globales y fuentes (Inter, Montserrat).
- **`frontend/src/App.tsx`** — Sustituido por `RouterProvider` y uso del router.
- **`frontend/src/app/router.tsx`** — Definición de rutas: `/`, `/login`, `/registro`, catch-all a `/`.
- **`frontend/src/assets/styles/variables.css`** — Tokens de diseño (colores, espaciado 8px, tipografía, sombras).
- **`frontend/src/components/ui/Button.tsx`** + **`Button.module.css`** — Botón con variantes (primario, secundario, terciario, danger) y tamaños (sm, md, lg).
- **`frontend/src/components/ui/Input.tsx`** + **`Input.module.css`** — Input con label, error, icono opcional y estados focus/error.
- **`frontend/src/components/ui/index.ts`** — Export de componentes UI.
- **`frontend/src/components/layout/AuthLayout.tsx`** + **`AuthLayout.module.css`** — Layout centrado con card sobre fondo oscuro para login/registro.
- **`frontend/src/features/auth/LoginPage.tsx`** — Formulario de login (email, contraseña), validación básica en cliente, estado de carga, redirección a `/` tras submit (simulado).
- **`frontend/src/features/auth/RegisterPage.tsx`** — Formulario de registro (nombre, email, contraseña, confirmación), validación en cliente, redirección a `/login` tras submit (simulado).
- **`frontend/src/features/auth/HomePlaceholder.tsx`** + **`HomePlaceholder.module.css`** — Pantalla placeholder en `/` con mensaje de bienvenida y enlace a login.
- **`frontend/src/features/auth/AuthPages.module.css`** — Estilos compartidos de títulos y formularios de auth.
- **Eliminado:** `frontend/src/App.css` (ya no se usa).

### Rutas definidas

| Ruta        | Componente        | Descripción                          |
|------------|-------------------|--------------------------------------|
| `/`        | HomePlaceholder   | Pantalla post-login (placeholder).  |
| `/login`   | LoginPage         | Inicio de sesión.                    |
| `/registro`| RegisterPage      | Alta de cuenta.                      |
| Cualquier otra | Redirect a `/` |                                      |

---

## Referencias

- `/docs/GuiaDesarrollo.md` — Protocolo de documentación y nomenclatura.
- `/docs/EstructuraFront.md` — Estructura de carpetas del frontend.
- `/docs/identidad_visual_y_mas.md` — Sistema de diseño (colores, tipografía, componentes, Phosphor Icons).
- `/docs/Entidades.md` — User, Tenant; útil para cuando se conecte el backend.
- `/docs/Arquitectura.md` — Autenticación JWT y stack React.

---

## Estado actual y próximos pasos

- **Seguimos en login y registro:** El flujo de auth (pantallas, layout de dos columnas, paneles con iconos de funciones e ilustración estadísticas) sigue siendo el foco. Aún no está conectado al backend.
- **25/02:** Continuar con diseño (ajustes visuales, detalles de identidad, o siguientes pantallas según prioridad).
