# Identidad Visual y Sistema de Diseño — POS Indumentaria SaaS

**Tags:** `#Modulo_Frontend`, `#Area_UI`, `#Identidad_Visual`, `#Design_System`  
**Referencia:** Guía de desarrollo del proyecto — documentación de diseño de larga duración para el equipo frontend.

---

## 1. Personalidad de marca y tono

El sistema es un **punto de venta retail moderno, profesional y orientado a la moda**, construido con React. La identidad debe transmitir:

| Atributo        | Descripción |
|-----------------|-------------|
| **Moderno**     | Interfaz actual, sin elementos obsoletos. |
| **Eficiente**   | Flujos claros, pocos clics, información priorizada. |
| **Minimal**     | Solo lo necesario; sin ruido visual. |
| **Profesional** | Serio, confiable, apto para uso en tienda. |
| **Tech-forward**| Sensación de producto tecnológico y bien construido. |

**Tono de comunicación:** Claro, directo y amigable sin ser informal. Evitar jerga innecesaria; priorizar mensajes concisos y accionables.

---

## 2. Sistema de color

> **Nota:** Los valores hex indicados son una paleta de referencia. Es probable que los colores se ajusten más adelante según avance el diseño; cuando se defina la paleta final, se actualizará esta sección y los tokens en código.

### 2.1 Paleta base

> Actualizado para alinear login y dashboard sobre fondos claros.

| Rol              | Hex       | Uso principal |
|------------------|-----------|----------------|
| **Base clara**   | `#f9fafb` | Fondo general de la app (login, dashboard). |
| **Superficie**   | `#ffffff` | Cards, modales y paneles en foreground. |
| **Base oscura**  | `#111827` | Texto de alto contraste, posibles vistas en modo oscuro futuro. |
| **Primario**     | `#2563eb` | CTAs, enlaces, estados activos, acentos de marca. |

### 2.2 Escala de grises (soporte)

Escala de claro a oscuro para texto, bordes, fondos secundarios y estados:

| Nombre   | Hex       | Uso sugerido |
|----------|-----------|----------------|
| Gray 50  | `#f9fafb` | Fondos muy suaves, hover sutil. |
| Gray 100 | `#f3f4f6` | Fondos de secciones, cards en claro. |
| Gray 200 | `#e5e7eb` | Bordes suaves, divisores. |
| Gray 300 | `#d1d5db` | Bordes, iconos secundarios. |
| Gray 400 | `#9ca3af` | Placeholders, texto deshabilitado. |
| Gray 500 | `#6b7280` | Texto secundario. |
| Gray 600 | `#4b5563` | Texto terciario, labels. |
| Gray 700 | `#374151` | Texto body en fondos claros. |
| Gray 800 | `#1f2937` | Texto body en fondos oscuros. |
| Gray 900 | `#111827` | Títulos, texto de máximo contraste (coincide con base oscura). |

### 2.3 Colores semánticos

| Semántica | Hex       | Uso |
|-----------|-----------|-----|
| **Success** | `#059669` | Confirmaciones, stock OK, venta completada. |
| **Warning** | `#d97706` | Alertas no críticas, stock bajo, pendientes. |
| **Error**   | `#dc2626` | Errores de validación, fallos, stock insuficiente. |
| **Info**    | `#2563eb` o `#93c5fd` | Mensajes informativos, hints (primario o variante clara). |

### 2.4 Reglas de uso del color

- **Regla 60-30-10:** Aproximadamente 60% color dominante (base/fondo), 30% color secundario (grises/superficies), 10% color de acento (primario y semánticos).
- **Accesibilidad:** Cumplir WCAG 2.1 nivel AA como mínimo. Contraste texto/fondo ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande). Revisar primario y semánticos sobre fondos claros y oscuros.
- **Contraste:** No usar primario como único indicador de información; combinar con icono o texto. Evitar primario sobre base oscura sin ajuste de luminosidad si el contraste no es suficiente.

### 2.5 Paleta aplicada a dashboard y vistas analíticas

En el **dashboard** y pantallas de catálogo/nuevo producto se aplica una variante clara de la paleta:

- **Fondo general:** `Gray 50` (`#f9fafb`).
- **Cards y paneles:** `Superficie` (`#ffffff`) con borde `Gray 200`.
- **Texto principal:** `Gray 900` para títulos, `Gray 700/600` para texto secundario.
- **Acentos y gráficos:** Primario `#2563eb` y su variante de foco `#3b82f6`, usados en:
  - Barras de progreso.
  - Líneas y áreas de gráficos.
  - Badges y contadores activos.
- **Chips y etiquetas:** Fondos con primario en baja opacidad (ej. `rgba(37, 99, 235, 0.08)`) y texto en primario.
- **Feedback:** Success y Error en tonos suaves (`rgba` con los hex de semánticos) para alerts y toasts.

---

## 3. Tipografía

### 3.1 Familias

| Rol        | Fuente     | Uso |
|------------|------------|-----|
| **Primaria**   | **Inter**  | Todo el texto de UI: body, labels, inputs, tablas, botones. |
| **Secundaria** | **Montserrat** | Títulos, encabezados, branding y elementos que requieran mayor personalidad. |

### 3.2 Escala tipográfica

Definir una escala consistente (ej. 1.25 o 1.2) para tamaños y line-heights:

| Nombre   | Uso típico | Tamaño (ej.) | Line height (ej.) |
|----------|------------|--------------|-------------------|
| xs       | Captions, hints, badges. | 0.75rem (12px) | 1rem |
| sm       | Labels, metadata. | 0.875rem (14px) | 1.25rem |
| base     | Body principal. | 1rem (16px) | 1.5rem |
| lg       | Lead, resúmenes. | 1.125rem (18px) | 1.75rem |
| xl       | Subtítulos. | 1.25rem (20px) | 1.75rem |
| 2xl      | Títulos de sección. | 1.5rem (24px) | 2rem |
| 3xl      | Títulos de página. | 1.875rem (30px) | 2.25rem |
| 4xl      | Hero, branding. | 2.25rem (36px) | 2.5rem |

### 3.3 Principios de espaciado y legibilidad

- **Line height:** Mínimo 1.25 en UI densa; 1.5 para párrafos.
- **Spacing:** Respetar el sistema de espaciado (rejilla 8px) entre bloques de texto y otros elementos.
- **Peso:** Regular (400) para body; Medium (500) para énfasis; Semibold (600) o Bold (700) solo para títulos o CTAs cuando la guía lo indique.

---

## 4. Iconografía

### 4.1 Sistema principal

- **Phosphor Icons** como sistema de iconos principal.
- Consistencia en estilo (stroke/outline o fill según reglas).

### 4.2 Peso del trazo (stroke)

| Peso   | Uso |
|--------|-----|
| **Regular** | Uso por defecto en navegación, listas, acciones secundarias. |
| **Bold**    | Acciones primarias, estados activos, énfasis, CTAs. |

Definir una regla clara: por ejemplo "Regular para todo excepto botón primario y estado activo en tabs".

### 4.3 Tamaños de icono

| Tamaño | Uso |
|--------|-----|
| 16px   | Inline con texto sm, listas compactas. |
| 20px   | Inline con texto base, botones estándar. |
| 24px   | Botones principales, headers, acciones destacadas. |
| 32px   | Empty states, ilustraciones pequeñas, módulos. |

Mantener proporción con el texto adyacente (alineación óptica cuando sea posible).

---

## 5. Imagen e ilustración

- **Estilo:** Minimal, sin fotos stock genéricas.
- **Color:** Adaptaciones monocromáticas o con la paleta de marca (primario + grises); evitar paletas ajenas al sistema.
- **Fondos:** Geométricos abstractos, patrones sutiles, gradientes discretos.
- **Ilustraciones:** Si se usan, que sean coherentes (mismo trazo, misma paleta) y con propósito (onboarding, empty states, feedback).

---

## 6. Principios de diseño de UI

- **Mobile-first:** Diseñar primero para pantallas pequeñas; luego escalar a tablet y escritorio.
- **Espaciado:** Rejilla base de **8px** (márgenes, paddings, gaps).
- **Bordes:** Esquinas redondeadas estándar **12px** para cards, modales y botones; variantes más pequeñas (8px, 6px) para chips o inputs si se definen.
- **Sombras:** Sutiles; una escala predefinida (sm, md, lg) para elevación y jerarquía.
- **Animaciones:** Mínimas; transiciones cortas (150–300 ms) para hover, focus y feedback, sin distraer.

---

## 7. Guías de componentes

### 7.1 Botones

- **Variantes:** Primario (fondo primario), Secundario (outline o ghost), Terciario (texto o ghost), Danger (acción destructiva).
- **Tamaños:** sm, md, lg con altura y padding alineados a la rejilla de 8px.
- **Estados:** Default, hover, active, focus (visible), disabled.
- **Iconos:** Mismo peso (Regular/Bold) según variante; tamaño acorde al tamaño del botón.

### 7.2 Campos de entrada (inputs)

- Altura consistente; bordes redondeados; borde sutil en default.
- Estados: default, focus (borde primario o ring), error (borde/icono semántico), disabled.
- Labels visibles; placeholders opcionales y no sustitutivos del label.
- Mensajes de error debajo del campo, en color semántico error.

### 7.3 Cards

- Fondo de superficie (gris claro u oscuro según tema); border-radius 12px; sombra sutil.
- Padding interno según rejilla 8px.
- Opcional: header con título en Montserrat; cuerpo en Inter.

### 7.4 Modales

- Overlay semitransparente; contenido centrado; border-radius 12px; sombra elevada.
- Botón de cierre visible; acciones principales alineadas (ej. derecha: Cancelar / Confirmar).
- Evitar modales anidados; preferir flujos secuenciales cuando sea posible.

### 7.5 Estados de feedback

- **Loading:** Spinner o skeleton con color primario; no bloquear toda la pantalla salvo flujos críticos.
- **Empty state:** Ilustración o icono + mensaje breve + CTA si aplica.
- **Error:** Mensaje claro + acción de reintento o corrección.
- **Success:** Toast o mensaje breve; auto-dismiss en unos segundos para no interrumpir.

---

## 8. Reglas de consistencia de marca para desarrollo futuro

1. **Tokens primero:** Usar variables/tokens para colores, tipografía, espaciado y sombras; no valores hardcodeados.
2. **Componentes sobre custom:** Preferir componentes del design system antes que estilos ad hoc; documentar nuevos patrones cuando se repitan.
3. **Accesibilidad por defecto:** Contraste, focus visible, labels y roles ARIA en componentes interactivos.
4. **Una fuente de verdad:** Este documento y, si existe, una librería de componentes (Storybook o similar) como referencia única para el equipo.
5. **Revisiones de UI:** Cambios que afecten identidad visual o patrones globales deben validarse contra esta guía antes de merge.
6. **Mobile-first en código:** Estilos base para móvil; media queries para escalar; touch targets mínimos 44px.
7. **Idioma y tono:** Mantener coherencia con la Guía de Desarrollo (nomenclatura, mensajes al usuario) en todos los textos de la interfaz.

---

*Documento de referencia para el equipo frontend. Actualizar al añadir nuevos tokens, componentes o reglas de identidad visual.*
