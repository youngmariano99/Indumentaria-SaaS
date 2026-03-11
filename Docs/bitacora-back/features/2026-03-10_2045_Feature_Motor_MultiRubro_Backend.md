---
Tags: #Modulo_Arquitectura, #Importancia_Alta, #Area_Backend, #Nivel_SaaS_2.0
---

# Feature: Motor Multi-Rubro - Diccionarios Dinámicos

**Fecha y Hora:** 2026-03-10 20:45
**Tipo de Cambio:** Nueva Función / Refactor

## Propósito
Implementar la capacidad del sistema para adaptarse a diferentes rubros comerciales (Indumentaria, Ferretería, etc.) sin cambios en el código. Se introdujo una capa de traducción dinámica que permite renombrar conceptos base (como "Producto" por "Artículo") basándose en el rubro del inquilino.

## Impacto en Multi-tenancy
- **Retrocompatibilidad:** Se creó el rubro "Indumentaria" con los términos actuales para asegurar que los clientes existentes no vean cambios.
- **Identidad Extendida:** El `ITenantResolver` ahora provee no solo el `TenantId`, sino también el diccionario de términos del `RubroId` asociado.
- **Inyección Automática:** Mediante `DiccionarioRubroMiddleware`, el frontend recibe el manifiesto del rubro en cada respuesta (`X-Rubro-Manifest`), eliminando la necesidad de consultas extra.

## Detalle Técnico
1. **Entidad Rubro:** Almacena `DiccionarioJson` (jsonb).
2. **Migración `20260310232934_AddRubroEntity`:** 
   - Crea tabla `Rubros`.
   - Seed: Inserta rubro "Indumentaria" con ID `d1e0f6a2-1234-5678-90ab-cdef01234567`.
   - Update: Asigna este rubro a todos los `Inquilinos` actuales.
3. **RubroLocalizer:** Implementación de `IStringLocalizer` que usa el diccionario del inquilino actual para traducir cadenas en el backend (ej. mensajes de error o validaciones).
4. **Program.cs:** Registro de servicios y orden de middlewares (`TenantResolver` -> `DiccionarioRubro`).

---

## Explicación Didáctica
Convertimos al sistema en un **traductor políglota**. 
Antes, el sistema solo sabía hablar "Indumentaria". Ahora, cada vez que un cliente entra, el "portero" (Middleware) se fija qué idioma habla ese cliente (su Rubro) y le entrega un **manual de términos** (Diccionario). 
Si el manual dice que en este negocio a las "Remeras" las llamamos "Insumos Técnicos", todo el sistema (backend y frontend) empezará a usar ese nombre automáticamente.

Archivos clave:
- `Rubro.cs`: El modelo del "manual de términos".
- `RubroLocalizer.cs`: El traductor que usa el manual en el backend.
- `DiccionarioRubroMiddleware.cs`: El encargado de enviarle el manual al frontend en un sobre (Header).
