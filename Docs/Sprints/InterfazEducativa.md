# Plan de Sprints: Interfaz y UX Educativa (Zero-Training)

**Objetivo:** Implementar una interfaz que eduque al usuario (dueños y empleados) de forma progresiva, elimine la fricción cognitiva y permita una escalabilidad multi-rubro inmediata.

---

## 🟢 Sprint 1: Cimientos de UI Agnostica y Modular (COMPLETADO)
*Foco: Crear las piezas del rompecabezas que se reutilizarán en todos los rubros.*

- [x] **Design Tokens:** Centralización de colores, espaciados y tamaños de fuentes en `variables.css`.
- [x] **Componente `Button` Educativo:** Implementación de variantes y estado `educational` para guía visual.
- [x] **Componente `EmptyState` Activo:** Diseño de estados vacíos con ilustraciones, micro-copy educativo ("¿Sabías que?") y botones de acción clara.
- [x] **Componente `Disclosure` con Hint:** Implementación de acordeones que ocultan complejidad y ofrecen ayuda contextual solo bajo demanda.
- [x] **Hook `useSmartDefaults`:** Sistema de valores predeterminados inteligentes para ahorrar decisiones al usuario.

---

## 🟢 Sprint 2: Vernacular Design y UI Mutante (COMPLETADO)
*Foco: Que el sistema hable el idioma del negocio automáticamente.*

- [x] **Motor de Traducción por Rubro:** Implementación de `translateLabel` para mutar términos (Talle vs Medida, Producto vs Repuesto).
- [x] **Aislamiento de Verticales:** Estructura de carpetas `src/verticals/` para separar lógica específica sin ensuciar el core.
- [x] **Refactor de Variantes:** Restauración del generador combinatorio para Ferretería vs Indumentaria con inputs independientes por eje.

---

## 🟡 Sprint 3: Reversibilidad y Reducción de Fricción (PRÓXIMAMENTE)
*Foco: Dar seguridad psicológica al usuario para que "no tenga miedo de romper nada".*

- [ ] **Sistema de Undo (Deshacer) Global:** Implementar un middleware de Toasts que permita revertir eliminaciones o cambios críticos en un lapso de 5-7 segundos.
- [ ] **Eliminación de Modales de Confirmación:** Sustituir los "¿Está seguro?" por la acción inmediata + botón de deshacer.
- [ ] **Barreras Catastróficas:** Implementar botones de "Mantener para confirmar" (Hold to Action) para acciones irreversibles como cierres de caja o borrado de inquilinos.

---

## 🟡 Sprint 4: Micro-Misiones y Onboarding Automatizado (PRÓXIMAMENTE)
*Foco: Capacitación de empleados sin intervención del dueño.*

- [ ] **Motor de Micro-misiones:** Sistema que detecta el progreso del usuario y propone desafíos simples (ej: "Realizá tu primera venta", "Cargá tu primer proveedor").
- [ ] **Walkthroughs Reactivos:** Onboarding que atenúa la pantalla y solo avanza cuando el usuario realiza la acción real en la interfaz.
- [ ] **Dashboard de Progreso:** Visualización simple para el dueño sobre qué módulos ya domina el empleado nuevo.

---

## 🟡 Sprint 5: Refinamiento Progresivo por Rol (PRÓXIMAMENTE)
*Foco: Simplicidad absoluta según quién use el sistema.*

- [ ] **UI Condicional por Rol:** Ocultamiento agresivo de módulos avanzados para perfiles operativos (Cajeros/Reposidores).
- [ ] **Simplificación Fiscal Automática:** Ocultar tecnicismos de IVA/Impuestos si el tenant es Monotributista.
- [ ] **Tooltips Contextuales Dinámicos:** Asistente que explica campos técnicos (`?`) absorbiendo definiciones desde el backend.

---

> **Regla de Oro:** La educación debe ser invisible. Si el usuario necesita un manual, la interfaz falló.
