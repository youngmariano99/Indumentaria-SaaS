# Resumen General del Sistema (Frontend)
**Rango de Fechas:** 24 de Febrero de 2026 — 28 de Febrero de 2026
**Propósito:** Proporcionar un panorama instantáneo del estado actual de la interfaz de usuario (React/Vite) a desarrolladores y futuras inteligencias artificiales, delineando qué capacidades visuales e interactivas están ya operativas.

---

## 🎨 1. Base UI y Design System
Se construyó una librería interna de componentes (Button, Input) utilizando rigurosamente _CSS Modules_ globales, desterrando Tailwind de las vistas complejas para ganar mantenibilidad a largo plazo.
- Toda la aplicación consume tokens centralizados (`variables.css`): sistema de colores (Gray-50 a 900, Primario Azul, Success/Danger), márgenes múltiples de 8px e hilos tipográficos duales (*Inter* y *Montserrat*).
- Uso coherente e indispensable de **Phosphor Icons** en todas partes.

## 🔐 2. Gateways de Autenticación (`/login` y `/registro`)
- **Login:** Panel dual inscripto dentro de un `AuthLayout`. Pide email y contraseña (el 'subdominio' es temporal para desarrollo). Posee un cliente Axios (`apiClient.ts`) automatizado: una vez se entra, se clava el Token JWT en el Store global `Zustand`. El router vigila todo bajo un `<RequireAuth>`.
- **Registro Seguro:** Al dar de alta un local de ropa, el usuario no inventa URLs complejas. El campo "Nombre del Negocio" en React computa de fondo (Regex/Trim) un `subdominio` limpio estilo e-commerce moderno ("Ropa Cami" se convierte en la clave `ropa-cami`).

## 🏠 3. Experiencia Post-Login: Layout y Estadísticas (`/dashboard`)
Se resolvió un grave problema de renderizado utilizando un enrutamiento por anidación con React Router (`<Outlet>`). 
- Existe el **`AppLayout`**, el cascarón que contiene la "Barra Lateral de Menú", presente en todo el sistema sin recargarse nunca (SPA pura).
- **Dashboard:** Se generó una pantalla de bienvenida que diferencia a usuarios de SaaS frente a "Tiendas Online". La vista alberga tarjetas ricas con porcentajes, progreso de catálogos y gráficos de SVG nativos renderizando la salud del negocio. _[Estado de IA: Hoy 28/02 el Dashboard usa datos mockeados esperando Sprints posteriores de telemetría]_.

## 👕 4. Gestor de Catálogo y Matriz Reactiva (`/catalogo`)
El "corazón visual" del trabajo de ingreso de stock.
- **Grilla del Catálogo:** Diseño responsive mostrando _Cards_ de la ropa, su portada, el nombre, y cápsulas (chips) dibujando todos sus talles disponibles por debajo leyendo la DB.
- **Nuevo Producto Inmersivo:** Formulario pesado para matriz multi-variante. Tiene integraciones dinámicas (Ej: si eliges que la prenda es 'Calzado', el backend le avisa a React y aparecen talles recomendados del '37 al 45'). 
- El usuario tipea variaciones (ej: Colores Blanco y Rojo / Talles M y XL) armando automáticamente una "Tabla Reactiva" de 4 variantes. 
- **Edición en Lote (Bulk):** Controles avanzados estilo Mail V3: tildes (Checkbox) para elegir varias celdas que acaban de sumarse y empujar un "Precio $20.000" para todas a la vez minimizando clicks.

## ⚙️ 5. Configuración del Local (`/ajustes`)
Un panel para los clientes permitiendo editar el comportamiento por defecto de la base de datos de su tienda. Permite moldear atributos base (p.e: crear etiquetas personalizadas como "Tipo de Suela" según si lo que vende tu tienda son botines u ojotas).

## 🏪 6. Terminal de Caja Fuerte / Punto de Venta (`/pos`)
Layout táctil apaisado dividido en Catálogo Lateral y Ticket a Derecha (Estilo Fudo/MaxiRest).
- Conectado a APIs vivas: auto-carga todos los Methodos de Pago existentes para ese inquilino (ej: "QR MercadoPago, Tarjeta Crédito") con inhabilitación del botón "COBRAR" si uno no fue elegido o si el carrito está vacío.
- Manejo en vivo de estados para descuentos y recargos: re-computa totales interactivamente antes de consolidar la validación y disparar el HTTP POST al .NET.

---
*(Nota para nuevas IAs: Los componentes y visuales residen en `frontend/src/features/` bajo un patrón slices. Las conexiones web están aglomeradas internamente en carpetas `/api` en cada bloque bajo la clase `apiClient` compartida).*
