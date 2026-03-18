# ADR-004: Patrón Estrategia para Lógica de Negocio Multi-Rubro

- **Estado**: Aceptado
- **Fecha**: 2026-03-08
- **Autor**: Backend Lead

## Contexto
El flujo original de persistencia de productos (`CrearProductoCommandHandler`) estaba acoplado a la lógica de **Indumentaria**: esperaba talles, colores y una estructura de variantes predefinida. Al intentar incorporar la **Ferretería** (donde los productos pueden ser Fraccionables por metro o peso), el controlador creció en complejidad, rompiendo el principio de **Responsabilidad Única**.

## Decisión
Extraer la lógica de creación y validación de productos a través del **Patrón Estrategia (Strategy Pattern)**. El nucleo (`Core`) delegará el "Cómo se crea un producto" a la implementación que corresponda al `RubroId` activo del Inquilino.

### Detalles de Implementación:
1.  Implementación de una interfaz `ICreadorProductoStrategy` con un método `EjecutarCreacionAsync`.
2.  Implementación de `IndumentariaStrategy` (Lógica de talles/colores) y `FerreteriaStrategy` (Lógica de fraccionables/atributos técnicos).
3.  Uso de un **Estrategia Resolver** en `Program.cs` que inyecta la implementación correcta según el contexto del usuario.

## Consecuencias
### Positivas:
- **Desacoplo de Dominio**: El Core del SaaS se mantiene limpio y agnóstico a la industria.
- **Mantenibilidad**: Los cambios en las reglas de negocio de un rubro no afectan al resto del sistema.
- **Fácil Extensión**: Crear un rubro nuevo (ej: Veterinaria) implica implementar una nueva estrategia sin modificar el código legacy.

### Negativas:
- **Sobrecarga Inicial**: Requiere más interfaces y clases, aumentando ligeramente la verborragia del código inicial.
- **Inyección de Dependencias**: El `StrategyResolver` puede volverse complejo si hay docenas de estrategias. Se requiere una política clara de registro automático.
