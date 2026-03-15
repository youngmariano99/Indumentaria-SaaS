# Feature: Framework UX/UI Educativa (Zero-Training)
**Fecha:** 13-03-2026
**Autor:** Antigravity (AI)

## Descripción
Se ha implementado el núcleo de una arquitectura de diseño orientada a la educación del usuario final, siguiendo los principios de "divulgación progresiva", "ergonomía cognitiva" y "recuperación de errores". Esta estructura permite que la aplicación sea intuitiva sin necesidad de manuales externos, adaptándose dinámicamente según el rubro del negocio.

## Cambios Realizados

### 1. Sistema de Tokens y Diseño Base
- Actualización de `variables.css` con tokens específicos para UX Educativa:
    - `--touch-target: 44px` (Ergonomía táctil).
    - `--font-size-educational: 1.05rem` (Lectibilidad).
    - `--bg-educational`: Colores pasteles para zonas de ayuda.

### 2. Componentes Agnósticos y Modulares
- **Button**: Wrapper con soporte para estados de carga, iconos y prop `educational` para micro-animaciones en acciones clave.
- **EmptyState**: Reemplazo de listas vacías por estados accionables con ilustraciones, descripciones educativas y "Tips del sistema".
- **Disclosure**: Componente para divulgación progresiva, ocultando campos secundarios bajo títulos informativos para reducir el ruido visual.
- **FeedbackOverlay**: Sistema de notificaciones globales con soporte nativo para **UNDO (Deshacer)** en acciones críticas (ej: eliminaciones).

### 3. Inteligencia Contextual (Smart Defaults)
- Hook `useSmartDefaults`: Centraliza la lógica de terminología vernácula y valores por defecto inteligentes.
- Traducción dinámica de términos (ej: "SKU" -> "Código de Barras" en Indumentaria vs "Código de Producto" en Ferretería).

### 4. Refactorización de Módulos
- **Proveedores**: Lista con `EmptyState` educativo y formulario con `Disclosure` y placeholders predictivos.
- **Catálogo**: Grilla con soporte de `EmptyState` diferenciado (catálogo vacío vs sin resultados de búsqueda) y sistema de "Deshacer" al eliminar productos.

## Arquitectura
Los componentes se alojan en `src/shared/components`, garantizando que cualquier nuevo rubro o módulo pueda reutilizar esta lógica de diseño educativo de manera inmediata.
