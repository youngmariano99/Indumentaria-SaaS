# Fix: Visibilidad de campos dinámicos en Ferretería

**Fecha:** 2026-03-13
**Tipo:** Fix / UI-UX

## Problema
Los campos generados dinámicamente mediante `FieldFactory` (como Nombre, Descripción y Precios en el rubro Ferretería) aparecían "invisibles" (sin borde ni fondo), aunque permitían la escritura. Esto se debía al uso de variables CSS inexistentes en el componente común.

## Cambios Realizados

### Frontend
- **FieldFactory.module.css:** Se corrigieron las referencias a variables de color.
  - Se reemplazó `var(--color-border)` por `var(--color-gray-300)`.
  - Se reemplazó `var(--color-surface)` por `#ffffff`.
  - Se reemplazó `var(--color-text)` por `var(--color-gray-900)`.
  - Se reemplazó `var(--color-text-muted)` por `var(--color-gray-500)`.
  - Se estandarizó el padding para coincidir con el resto de la aplicación (`10px var(--space-4)`).
  - Se corrigió la sombra del foco (glow) que apuntaba a una variable RGB no definida.

## Impacto
- Los formularios de creación de productos para todos los rubros (especialmente los no-indumentaria que dependen más de `FieldFactory`) ahora son completamente legibles y usables.
- Mejora la consistencia visual entre componentes comunes y específicos de página.
