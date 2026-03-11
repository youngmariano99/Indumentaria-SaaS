---
Tags: #Modulo_UX, #Importancia_Media, #Area_Frontend, #Nivel_SaaS_2.0
---

# Feature: UX de Divulgación Progresiva - Drawers y Smart Defaults

**Fecha y Hora:** 2026-03-10 23:30
**Tipo de Cambio:** Mejora de UX / Refactor

## Propósito
Optimizar la velocidad de carga de productos y reducir la carga cognitiva del usuario mediante la automatización de valores y el uso de componentes no intrusivos para tareas secundarias.

## Impacto en UX
- **Velocidad:** Los "Smart Defaults" pre-completan el 60% del formulario basándose en el rubro del inquilino (ej. Indumentaria ya tiene seleccionada la escala AR y el tipo Ropa).
- **Fluidez:** El uso de `Drawer` (cajón lateral) permite editar detalles de variantes o crear nuevas categorías sin abandonar el flujo principal de creación del producto.
- **Ergonomía:** Menos clics para llegar al mismo resultado.

## Detalle Técnico
1. **Componente `Drawer.tsx`:** Implementación de un panel lateral con `backdrop-filter`, animaciones CSS y manejo de eventos de teclado (Esc).
2. **Hook `useRubro`:** Ingesta de `getSmartDefaults()` que inyecta valores iniciales en el estado de `NuevoProductoPage`.
3. **Integración Asíncrona:** El Drawer de categorías permite la creación asíncrona y actualización inmediata del selector de la página padre mediante una recarga de estado local.

---

## Explicación Didáctica
Convertimos la aplicación en un **asistente inteligente**. 
En lugar de presentarle al usuario una hoja en blanco enorme cada vez, el sistema ahora dice: "Sé que vendés ropa, así que ya te preparé los campos más comunes". 
Además, eliminamos los "carteles" (modales) que bloqueaban toda la pantalla por **cajones laterales** (Drawers). Es como tener una mesa de trabajo ordenada donde sacás las herramientas de un cajón solo cuando las necesitás, sin tener que levantarte de la silla.

Archivos clave:
- `Drawer.tsx`: El cajón lateral reutilizable.
- `useRubro.ts`: El cerebro que sabe qué valores son "lógicos" para cada negocio.
- `NuevoProductoPage.tsx`: El escenario donde estas dos piezas mejoran el flujo de trabajo.
