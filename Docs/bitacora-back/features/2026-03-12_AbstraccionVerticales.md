# Feature: Abstracción de Verticales (Multi-Rubro)

**Fecha:** 2026-03-12
**Sprint:** 5.5 - Abstracción de Verticales

## Descripción
Se ha implementado una arquitectura de "Verticales" para eliminar los condicionales estáticos (`if rubro == X`) en el Core. Ahora el sistema utiliza un patrón de Estrategia dinámico tanto en el Backend como en el Frontend.

## Cambios Realizados

### Backend
- **Core:** Definición de `IVerticalRules` para centralizar comportamientos específicos del rubro.
- **Infrastructure:** Implementación de `IndumentariaRules` y `FerreteriaRules`.
- **Infrastructure:** Creación de `VerticalRulesFactory` para resolver las reglas en tiempo de ejecución basado en el `RubroSlug`.
- **API:** Actualización de `Program.cs` para inyectar estrategias (`IValidadorProducto`, `ICreadorProductoStrategy`) usando el Factory y el Slug, eliminando la dependencia de GUIDs estáticos.
- **API:** Actualización de `ITenantResolver` y `TenantResolverMiddleware` para propagar el `RubroSlug` en cada petición.

### Frontend
- **Store:** Actualización de `rubroStore.ts` y `authStore.ts` para capturar y persistir el `rubroSlug` desde el Login.
- **Registry:** Mejora de `ComponentRegistry.ts` con un método `resolve` para carga perezosa de componentes verticales.
- **Hooks:** Actualización de `useRubro.ts` con el método `resolveComponent` para ser usado por las páginas base.
- **Refactor:** `NuevoProductoPage.tsx` ahora resuelve su grilla de variantes dinámicamente:
  ```typescript
  const VariantesGridDynamic = resolveComponent('VariantesGrid');
  ```

## Impacto
- **Escalabilidad:** Agregar un nuevo rubro (ej: Veterinaria) solo requiere crear las clases de reglas y componentes en sus carpetas respectivas y registrarlos, sin tocar la lógica core del sistema.
- **Mantenibilidad:** Se eliminó el "código espagueti" de condicionales en el `Program.cs` y componentes visuales.
