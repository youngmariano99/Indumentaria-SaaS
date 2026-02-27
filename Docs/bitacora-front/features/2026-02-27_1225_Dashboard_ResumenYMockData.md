# Frontend — Dashboard inicial (mock + diseño)

**Tags:** `#Modulo_Dashboard`, `#Area_Frontend`, `#Identidad_Visual`, `#Mock_Data`

---

## Fecha y hora

- **Fecha:** 2026-02-27  
- **Hora:** 12:25 (aproximada — Argentina)

---

## Tipo de cambio

**Nueva Función (UI + mock)** — Creación de un **primer dashboard** para POS Indumentaria: layout con navbar lateral, cards de métricas y gráficos simples basados en datos de ejemplo. Aún **no está conectado** al backend; se dejó preparado para consumir endpoints reales (incluyendo uno nuevo para usuarios del sistema).

---

## Qué se hizo

### 1. Ruta protegida `/dashboard` como home post-login

- Se agregó la ruta **`/dashboard`** en el router principal, envuelta en `RequireAuth`.
- El login, luego de `authApi.login` + `useAuthStore.login`, ahora **redirecciona a `/dashboard`** (antes iba a `/pos`).
- `/dashboard` renderiza el nuevo componente `DashboardPage`.

### 2. Layout: navbar lateral + contenido

- Se creó `DashboardPage` con un layout de dos columnas:
  - **Navbar lateral (sidebar)**
    - Logo compacto `PI` + texto `POS Indumentaria`.
    - Ítems: Dashboard, Catálogo, Punto de venta, Reportes, Configuración.
    - Usa **solo iconos** cuando está colapsado; iconos + texto cuando está expandido.
    - Implementado como **`position: sticky; top: 0; height: 100vh; overflow-y: auto;`** para que siempre quede visible mientras se hace scroll.
    - La colapsación se maneja con `sidebarOpen` en estado local y una clase `sidebarCollapsed` en el shell.
  - **Contenido principal**
    - Header con título `Resumen general` + selector de contexto `SaaS` / `Tienda online`.
    - Banda compacta de **“Usuarios del sistema”** justo debajo del título (ver punto 4).
    - Debajo, tarjetas y gráficos con datos mock (puntos 3 y 5).

---

## 3. Métricas y gráficos (mock, listos para API real)

Por ahora toda la lógica del dashboard usa **datos de ejemplo en arrays locales**:

- `salesLast7Days`: ventas por día de la última semana.
- `paymentByMethodToday`: ingresos por método de pago del día.
- `topProducts`: ranking de productos más vendidos.

### Cards principales

- **Productos en catálogo**
  - Muestra un número total de productos (`totalProductos`) y un objetivo (`catalogTarget`).
  - Renderiza una barra de progreso calculando `%` del objetivo.
  - El valor depende del contexto seleccionado:
    - `SaaS`: 324 productos (mock).
    - `Tienda online`: 187 productos (mock).

- **Ingresos por método de pago (hoy)**
  - Suma el total de `paymentByMethodToday` para mostrar `$totalIngresosHoy`.
  - Para cada método (Efectivo, Débito, Crédito, QR/billetera) dibuja:
    - Etiqueta.
    - Barra horizontal con color específico.
    - Porcentaje relativo al total del día.

### Gráficos

- **Ventas por día (últimos 7 días)**
  - Implementado con un **`<svg>` inline**, sin librerías externas.
  - Calcula la escala a partir de `maxSales` para normalizar los puntos.
  - Dibuja:
    - Área rellena con un `linearGradient` suave (`areaGradient`).
    - Línea violeta (`#6366f1`) por encima.
    - Pequeños círculos en cada punto de la serie.

- **Productos que más se vendieron**
  - Recorre `topProducts` y muestra:
    - Ranking (1., 2., 3.), nombre del producto.
    - Unidades vendidas + monto facturado.
    - Barra horizontal con ancho relativo al producto más vendido.

> **Importante:** Estos valores son **mock** y se deben reemplazar por API real en cuanto Mari tenga endpoints disponibles (ventas por día, ingresos por método de pago y ranking de productos).

---

## 4. Usuarios del sistema — diseño y endpoint sugerido

Se creó una banda compacta de **“Usuarios del sistema”** en la parte superior del dashboard:

- Visualmente:
  - Small card centrada (`userStrip`) debajo del título.
  - Icono de usuarios a la izquierda, título y subtítulo explicando que ahí se verá la actividad real.
  - A la derecha dos métricas:
    - `Usuarios SaaS: —`
    - `Personas en vivo: —`
  - Por ahora se muestran **guiones (“—”)** porque **no estamos consultando la base de datos** desde el frontend.

### Sugerencia de endpoint para backend (Mariano)

Para completar esta banda con datos reales, el frontend necesita un endpoint **simple** que entregue:

- Cantidad total de usuarios/tiendas registradas en el SaaS.
- (Opcional) Cantidad de personas actualmente activas en el sistema.

**Propuesta de contrato:**

- **Ruta sugerida:** `GET /api/admin/usuarios/resumen`
- **Respuesta (JSON):**

```json
{
  "totalUsuarios": 128,
  "usuariosActivosAhora": 37
}
```

- **Notas técnicas backend:**
  - `totalUsuarios`: puede ser un `COUNT(*)` sobre la tabla de usuarios o tenants (según cómo esté modelado: si cada tenant/tienda se mapea a una fila separada, quizá convenga llamar `totalTiendas`).
  - `usuariosActivosAhora`: se puede calcular en una iteración futura a partir de:
    - sesiones activas,
    - últimos requests vistos en una ventana de tiempo (ej. últimos 5–10 minutos),
    - o Presence si se implementa algo tipo SignalR.
  - Inicialmente podría devolverse `usuariosActivosAhora = 0` y llenar solo `totalUsuarios`, para no bloquear el trabajo de backend.

**Integración prevista en frontend:**

Cuando el endpoint exista, `DashboardPage` va a:

1. Hacer un `fetch` (o `axios.get`) a `/api/admin/usuarios/resumen` en un `useEffect`.
2. Guardar `totalUsuarios` y `usuariosActivosAhora` en estado.
3. Reemplazar los guiones `—` de la banda:
   - `Usuarios SaaS: {totalUsuarios}`
   - `Personas en vivo: {usuariosActivosAhora}`

---

## 5. Tienda online — funcionalidad de plan pago (placeholder)

El selector SaaS / Tienda online en el header del dashboard cambia el contenido:

- **SaaS**: muestra todas las cards y gráficos descritos en los puntos anteriores.
- **Tienda online**: por ahora **no muestra estadísticas reales**, sino solo:
  - Una card con título “Tienda online”.
  - Un texto aclarando que:
    - Es una funcionalidad de **plan pago**.
    - Aún no está habilitada en la cuenta.
    - En el futuro se verán allí métricas del canal online (ventas por día, carrito promedio, productos más vendidos, sesiones, etc.).

Esto deja clara la intención funcional y la comunicación al usuario final, sin implementar todavía la lógica ni endpoints de ecommerce.

---

## 6. Impacto en identidad visual

- El dashboard se apoya en la paleta clara definida en `identidad_visual_y_mas.md`:
  - Fondo general: `Gray 50` (`#f9fafb`).
  - Cards: `#ffffff` con borde `Gray 200`.
  - Títulos en `Gray 900`, texto secundario `Gray 700/600`.
  - Acentos en `Primario` (`#2563eb`) y `Primario focus` (`#3b82f6`) para barras y gráficos.
- La sidebar y los encabezados siguen el sistema de tipografías Inter/Montserrat y los tokens de espaciado a 8px.

---

## Archivos principales tocados

| Archivo | Cambio |
|--------|--------|
| `frontend/src/app/router.tsx` | Se agregó la ruta protegida `/dashboard` usando `RequireAuth` y se cambió el redirect post-login a `/dashboard`. |
| `frontend/src/features/dashboard/DashboardPage.tsx` | Nueva página de dashboard con layout, cards de métricas, gráficos SVG simples y banda de “Usuarios del sistema” con datos mock (dejando claro el endpoint sugerido). |
| `frontend/src/features/dashboard/DashboardPage.module.css` | Estilos del layout (sidebar sticky, grid de 12 columnas), tarjetas, barras de progreso, gráfico de líneas y banda de usuarios. |
| `Docs/bitacora-front/identidad_visual_y_mas.md` | Actualizada sección de paleta base y añadida subsección “Paleta aplicada a dashboard y vistas analíticas”. |

---

## Próximos pasos

- Backend:
  - Definir e implementar el endpoint `GET /api/admin/usuarios/resumen` (o nombre acordado) para completar la banda de “Usuarios del sistema”.
  - Diseñar futuros endpoints para:
    - ventas por día (últimos 7 días),
    - ingresos por método de pago del día,
    - ranking de productos más vendidos.
- Frontend:
  - Conectar las tarjetas y gráficos del dashboard a esos endpoints.
  - Afinar el diseño (espaciados, textos finales y posibles filtros de fecha) tomando como referencia el screenshot de producto tipo analytics.

