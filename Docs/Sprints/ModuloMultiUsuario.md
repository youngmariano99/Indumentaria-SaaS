# Plan de Sprints: Módulo Multi-Usuario (Gestión de Equipo)

**Objetivo:** Permitir que el dueño de negocio (Owner) delegue tareas a sus colaboradores de forma segura, controlando exactamente qué módulos pueden ver y editar.

---

## 🟢 Etapa 1: Infraestructura de Identidad (COMPLETADO)
*Foco: Definir quién es quién y cómo se aíslan los datos.*

- [x] **Modelo de Datos:** Entidad `Usuario` con vínculo a `TenantId` y campo `FeaturesJson` para permisos granulares.
- [x] **Roles del Sistema:** Definición de `SystemRole` (Owner, Manager, Cashier, Auditor).
- [x] **Aislamiento por Tenant:** Implementación de Global Query Filters en EF Core para que un usuario solo vea datos de su empresa.
- [x] **Motor de Permisos Jerárquico:** Backend preparado para resolver si una función está habilitada buscando en: Usuario -> Sucursal -> Inquilino.
- [x] **Middleware de Contexto:** Resolución automática del `UserId` del empleado en cada petición a la API.

---

## 🟢 Etapa 2: Gestión de Colaboradores (COMPLETADO)
*Foco: Interfaz para que el dueño invite y configure a su equipo.*

- [x] **API de Administración de Usuarios:**
    - [x] Endpoint para listar usuarios del mismo tenant.
    - [x] Endpoint para crear/editar usuarios (solo permitido para rol `Owner`).
    - [x] Lógica de validación: **"Límite de 1 colaborador gratis"**. Bloqueo de creación si se excede el límite del plan.
- [x] **Pantalla "Mi Equipo" (Frontend):**
    - [x] Lista de empleados con su rol y estado.
    - [x] Formulario de creación: Nombre, Email, Password inicial y selección de Rol.
- [x] **Panel de Permisos Granulares:**
    - [x] Selector de módulos habilitados (ej: "Puede ver Ventas", "No puede ver Informes", "Solo lectura en Catálogo").
    - [x] Integración con el `FeatureResolver` del backend para guardar estos permisos en el `FeaturesJson` del usuario.

---

## 🟢 Etapa 3: Seguridad Operativa y Acceso Rápido (COMPLETADO)
*Foco: Agilizar el uso diario sin comprometer la seguridad.*

- [x] **PIN de Acceso Rápido:** Implementación de código de 4 dígitos para que los cajeros cambien de turno rápidamente sin re-loguearse con email/password.
- [x] **Logs de Auditoría por Usuario:** Visualización de qué empleado realizó cada acción crítica (ej: "Venta anulada por Juan Pérez").
- [ ] **Restricción de Horarios/IP:** (Opcional) Permitir acceso solo en horarios comerciales o desde la red local del local.

---

> **Nota Técnica:** Al implementar el límite de usuarios, la configuración debe ser dinámica (inyectada por el plan del Inquilino) para facilitar la subida de límites en cuentas premium.
