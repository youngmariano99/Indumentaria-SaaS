# ADR-002: Migración a PostgreSQL Row Level Security (RLS)

- **Estado**: Aceptado
- **Fecha**: 2026-03-01
- **Autor**: Technical Lead

## Contexto
El aislamiento entre inquilinos (Tenants) es el **punto crítico de seguridad** más importante de un SaaS Multi-Inquilino. Inicialmente, el sistema utilizaba **Global Query Filters** de Entity Framework Core. Esta es una solución basada puramente en software que tiene varios riesgos:
1.  **Bypass accidental**: Una consulta mal escrita (ej: `IgnoreQueryFilters()`) o el uso de Dapper/SQL Crudo puede exponer accidentalmente datos de otros clientes.
2.  **Complejidad en DB**: Requiere inyectar filtros manualmente en cada tabla del `DbContext`.

## Decisión
Migrar la lógica de aislamiento desde la capa de software (EF Core) hacia la capa de infraestructura utilizando las políticas nativas de **Row Level Security (RLS)** de PostgreSQL.

### Detalles de Implementación:
1.  En cada petición, el Middleware del Backend extrae el `TenantId` del JWT.
2.  Antes de ejecutar cualquier consulta, se envía el comando `SET LOCAL app.current_tenant = 'UUID-AQUI'` a PostgreSQL.
3.  Las políticas en la base de datos limitan la visibilidad de las filas a aquellas donde `TenantId = current_setting('app.current_tenant')::uuid`.

## Consecuencias
### Positivas:
- **Blindaje de Datos**: La protección es inmutable e independiente del código de la aplicación. Incluso si un desarrollador olvida un filtro en C#, la base de datos rechazará la lectura de filas ajenas.
- **Transparencia**: El código del repositorio se vuelve más limpio al no tener que preocuparse por el filtrado de inquilino.
- **Rendimiento**: Permite optimizar índices de forma nativa considerando la distribución por Tenant.

### Negativas:
- **Complejidad de Debugging**: Ver los datos consolidados en entornos de desarrollo requiere permisos de SuperUsuario o el uso explícito de `EnterBypassMode()`.
- **Dependencia SQL**: Las migraciones requieren ahora scripts SQL manuales para definir las políticas en cada tabla nueva.
