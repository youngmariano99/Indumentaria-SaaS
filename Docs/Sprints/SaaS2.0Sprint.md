# Hoja de Ruta: SaaS 2.0 (Multi-Todo)
**Objetivo:** Evolucionar el sistema actual (.NET 8 + PWA) hacia una infraestructura de escalabilidad masiva: Multi-Inquilino, Multi-Sucursal, Multi-Usuario y Multi-Rubro.

## 🏁 Punto de Partida (Marzo 2026)
Este plan se construye sobre los hitos alcanzados en la versión actual (ver Referencias):
- **Backend:** Arquitectura Clean, Multitenancy básico con Global Filters y CRM avanzado (10/03/2026). Referencia: [Resumen Backend](file:///c:/Users/mari_/OneDrive/Escritorio/t/Indumentaria-SaaS/Docs/bitacora-back/2026-03-10_ResumenGeneral_Backend.md)
- **Frontend:** PWA con hardware sync y sistema de impresión universal (10/03/2026). Referencia: [Resumen Frontend](file:///c:/Users/mari_/OneDrive/Escritorio/t/Indumentaria-SaaS/Docs/bitacora-front/2026-03-10_ResumenGeneral_Frontend.md)
- **Arquitectura de Referencia:** [Guía Arquitectura Multi-Todo](file:///c:/Users/mari_/OneDrive/Escritorio/t/Indumentaria-SaaS/Docs/indicacionesIA/multiRubros/arquitectiraMultiTodo/arquitecturaMT.md)

---

## 📅 Plan de Sprints (SaaS 2.0)

### Sprint 1: Blindaje de Datos y RLS Nativo
*Foco: Seguridad a nivel de infraestructura para Multi-Tenant.*
- **Backend:** 
    - Migrar de *Global Query Filters* a **PostgreSQL Row-Level Security (RLS)**.
    - Implementar `DbConnectionInterceptor` para inyectar `SET LOCAL app.current_tenant` en cada apertura de conexión.
    - Configurar índices **GIN** para búsquedas JSONB de alto rendimiento.
- **DB:** Crear políticas RLS estrictas y roles restringidos.

### Sprint 2: Motor Multi-Rubro y Diccionario de Dominio
*Foco: Permitir que el sistema hable el idioma de cualquier negocio sin tocar el código.*
- **Backend:** 
    - Implementar middleware de **Diccionario Dinámico** que intercepte respuestas.
    - Sobrescribir `IStringLocalizer` para mapear "Producto" -> "Repuesto", "Variante" -> "Talle", etc., según metadatos del Rubro.
- **Frontend:** 
    - El cliente se vuelve "ciego": recibe etiquetas y placeholders directamente del backend.

### Sprint 3: Jerarquía Total y Feature Toggles
*Foco: Controlar permisos por Rubro > Inquilino > Sucursal > Usuario.*
- **Backend:** 
    - Implementar sistema de banderas con patrón **DataKey** (ej: herencia 1.3.7).
    - Cacheo agresivo de Nivel 1 (In-Memory) y Nivel 2 (Redis) para permisos.
- **Negocio:** Definición de planes (Básico vs Pro) vinculados a toggles de hardware o módulos específicos.

### Sprint 4: UI Mutante (Metadata-Driven)
*Foco: Eliminar condicionales estáticos en React.*
- **Frontend:** 
    - Implementar **FieldFactory** y **Component Registry**.
    - La interfaz se construye a partir de un **Manifiesto de Metadatos (JSON Schema)** enviado por el backend al autenticar.
    - Implementar **Code Splitting Dinámico** para que rubros no pesados no descarguen JS innecesario (ej: mallas de talles).

### Sprint 5: UX de Divulgación Progresiva
*Foco: Simplicidad para negocios pequeños, potencia para corporativos.*
- **Frontend:** 
    - Refactor de formularios de alta usando cajones laterales para datos avanzados.
    - Implementar **"Smart Defaults"** y **Estados Vacíos Educativos** basados en el rubro del inquilino.
- **Backend:** Inyección de micro-copy educativo en las respuestas de error/vacío.

---

## 🚀 Refactorización: Arquitectura Multi-Rubro (Fase 1 y Fase 2)

### Sprint 6: Arquitectura Base y Patrón Estrategia (COMPLETADO)
*Foco: Sentar las bases del Monolito Modular y Extracción del Frontend.*
- **Backend:** 
    - Implementado `IValidadorProducto` y patrón estrategia por `RubroId` en `Program.cs`.
- **Frontend:** 
    - Extraído `VariantesGrid` a su vertical (`Indumentaria`).
    - Implementada carga perezosa (`React.lazy`) en `NuevoProductoPage` a través de `ComponentRegistry`.

### Sprint 7: Estrategia de Creación de Productos (COMPLETADO)
*Foco: Modularizar la lógica de persistencia y guardado en la base de datos para no depender de Indumentaria en el Core.*
- **Backend:**
    - Refactorizar `CrearProductoConVariantesCommandHandler`.
    - Crear `ICreadorProductoStrategy` para delegar la creación de variantes, atributos y stock a implementaciones por rubro.

### Sprint 8: Carga de Formularios Metadata-Driven (COMPLETADO)
*Foco: Construcción dinámica de UI según el tenant activo, sin condicionales estáticos en React.*
- **Frontend / Backend:**
    - Schema Registry: El backend provee un JSON que define qué campos se renderizan al crear/editar productos (ej: Ferretería usa "Material", Indumentaria usa "Talle").
    - Implementación de `FormularioProductoBase` en el front para ingerir este Manifiesto JSON.

### Sprint 9: Modelo de Base de Datos Dinámico (COMPLETADO)
*Foco: Asegurar campos dinámicos a nivel base de datos y búsqueda de alta velocidad.*
- **Base de Datos (PostgreSQL):**
    - Uso profundo de campos `JSONB` para Atributos dinámicos.
    - Índices GIN sobre atributos variables usando el Fluent API (`HasMethod("gin")`).

---
> **Regla de Oro:** Queda prohibido el uso de `if (rubro === 'X')` en todo el codebase. Toda variabilidad debe ser inyectada por el motor de metadatos.
