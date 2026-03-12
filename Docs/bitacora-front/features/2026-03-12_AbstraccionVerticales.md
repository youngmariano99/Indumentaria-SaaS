# Feature: Implementación de useVerticalComponent y Registro Dinámico

**Fecha:** 2026-03-12
**Sprint:** 5.5 - Abstracción de Verticales

## Descripción
Refactorización del sistema de componentes para soportar múltiples rubros de forma dinámica, eliminando condicionales harcodeados en las páginas principales.

## Cambios Realizados
- **useRubro Hook:** Nuevo método `resolveComponent(key)` que consulta el `ComponentRegistry` usando el `rubroSlug` actual.
- **ComponentRegistry:** Implementación de método `resolve` con fallback automático a `indumentaria`.
- **NuevoProductoPage:** Migración a resolución dinámica. El componente ya no sabe qué rubro está cargando; simplemente pide el `VariantesGrid` correspondiente al contexto activo.
- **Store Sincronización:** Se añadió el campo `rubroSlug` al flujo de autenticación para permitir la identificación técnica del rubro sin depender de IDs de base de datos volátiles.

## Ejemplo de Uso
```tsx
const { resolveComponent } = useRubro();
const SpecificGrid = resolveComponent('VariantesGrid');
// ...
<SpecificGrid {...props} />
```
