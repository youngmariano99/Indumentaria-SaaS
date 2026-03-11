---
Tags: #Modulo_Seguridad, #Importancia_Media, #Area_Backend, #Nivel_SaaS_2.0
---

# Feature: Feature Toggles Jerárquicos

**Fecha y Hora:** 2026-03-10 21:00
**Tipo de Cambio:** Nueva Función

## Propósito
Implementar un sistema de "interruptores" de funcionalidades que permita habilitar o deshabilitar características de manera granular y jerárquica. La resolución sigue la prioridad: Usuario > Sucursal > Inquilino > Rubro.

## Impacto en Multi-tenancy
- **Flexibilidad Comercial:** Permite vender módulos adicionales a inquilinos específicos o habilitar betas para usuarios seleccionados.
- **Rendimiento:** Implementación de `IMemoryCache` (Caché L1) para evitar consultas redundantes a la base de datos en cada verificación de feature.
- **Seguridad:** El resolvedor opera bajo bypass de RLS cuando es necesario para leer configuraciones superiores (como las del Rubro).

## Detalle Técnico
1. **Interfaz `IFeatureResolver`:** Métodos `IsEnabled` y `GetAllEnabledAsync`.
2. **Jerarquía de Resolución:** La lógica en `FeatureResolver.cs` busca el valor de la clave en el JSONB de Usuario, si no existe sube a Sucursal, luego Inquilino y finalmente Rubro.
3. **API Endpoint:** `/api/features/my-features` para que el frontend obtenga todas las features activas del contexto actual al iniciar.

---

## Explicación Didáctica
Imaginen que el sistema tiene una **consola de control** con muchas palancas. 
Hay una palanca general para todos los que venden ropa (Rubro), pero si un dueño de local (Inquilino) quiere una función especial, puede mover su propia palanca para activarla solo para él. 
Incluso, si un empleado específico (Usuario) necesita una herramienta de prueba, se le puede activar solo a él. El sistema siempre mira primero la palanca que tiene más cerca (Usuario) y si no sabe qué hacer, mira la siguiente más arriba.

Archivos clave:
- `IFeatureResolver.cs`: El contrato del "inspector de palancas".
- `FeatureResolver.cs`: El motor que decide qué palanca manda.
- `FeaturesController.cs`: El mensajero que le avisa al frontend qué palancas están activadas.
