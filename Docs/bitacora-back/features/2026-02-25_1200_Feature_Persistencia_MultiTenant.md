# 2026-02-25_1200_Feature_Persistencia_MultiTenant

#Modulo_Infraestructura #Importancia_Critica #Area_Backend #Nivel_Seguridad

## Fecha y Hora
2026-02-25 12:00 HS

## Tipo de Cambio
Nueva Funcionalidad (Sprint 2 Completo).

## Impacto en Multi-tenancy
**TOTAL**. Este desarrollo establece las bases de la seguridad y el aislamiento de datos.
- Se implementó `IMustHaveTenant` para obligar a las entidades a tener un dueño.
- Se activó RLS (Row Level Security) en PostgreSQL para que el motor de base de datos bloquee físicamente el acceso a filas de otros inquilinos, incluso si el programador olvida el `Where`.

## Detalle Técnico
1. **Entity Framework Core**:
   - `ApplicationDbContext` configurado con Npgsql.
   - **Global Query Filters**: `builder.Entity<T>().HasQueryFilter(e => e.TenantId == _tenantResolver.TenantId)`.
   - **Interceptors**: 
     - `AuditInterceptor`: Captura `SaveChanges` y serializa cambios en JSONB.
     - `TenantSessionInterceptor`: Inyecta `SET SESSION "app.current_tenant"` al abrir conexiones SQL.

2. **Middleware**:
   - `TenantResolverMiddleware`: Lee `X-Tenant-Id` (temporal) y lo inyecta en el Scoped Service.

3. **Base de Datos**:
   - Tablas creadas con UUIDs.
   - RLS habilitado en todas las tablas sensibles (Productos, Clientes, etc.).
   - Excepciones: `Inquilinos` (Maestra), `ItemsComprobante` (Heredada), `TransaccionesBilleteras` (Heredada).

---

## Explicación Didáctica

### Analogía: El Edificio de Departamentos Seguro

Imagina que nuestra aplicación SaaS es un **Edificio de Departamentos de Alta Seguridad**.

1. **El Portero (Middleware):**
   - Cuando alguien llega a la puerta (una Petición HTTP a la API), el portero (`TenantResolverMiddleware`) le pide su identificación (`X-Tenant-Id`).
   - El portero anota en una tarjeta de visitante: "Esta persona va al departamento 5A".
   - Si no trae identificación, no entra.

2. **El Pasillo Inteligente (Interceptor de Sesión):**
   - Cuando el visitante sube al ascensor para ir a buscar algo al depósito (Base de Datos), el ascensor (`TenantSessionInterceptor`) le avisa al encargado del depósito: "Ojo, que viene uno del 5A".
   - Esto configura el entorno antes de que la persona toque nada.

3. **El Encargado del Depósito (Row Level Security - RLS):**
   - Este es el nivel de seguridad más alto. El encargado es **PostgreSQL**.
   - Aunque el visitante quiera hacerse el vivo y pedir "Dame las cosas de TODOS los departamentos", el encargado tiene unas gafas especiales (Políticas RLS) que filtran su visión.
   - El visitante *cree* que está viendo todo, pero el encargado solo le muestra las cajas etiquetadas con "5A". Si intenta tocar una caja del "4B", el encargado le dice "Esa caja no existe" (o le da error de acceso).
   - Esto garantiza que, aunque el programador Backend se equivoque y se olvide de filtrar, la base de datos **nunca** entregará datos ajenos.

4. **La Cámara de Seguridad (AuditInterceptor):**
   - Hay una cámara oculta (`AuditInterceptor`) que filma todo lo que la gente se lleva o cambia.
   - Guarda un video (`JSONB`) con el "antes" y el "después" de cada objeto tocado en la tabla `LogsAuditoria`. Así sabemos quién rompió qué y cuándo.
