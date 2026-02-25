# Bitácora de Desarrollo: Sprint 2.1 - Identidad, Accesos y Subdominios
**Fecha:** 25/02/2026

## Objetivos del Sprint
Implementar un sistema de autenticación seguro que soporte nativamente el aislamiento multi-inquilino definido en el Sprint 2 (Entity Framework + PostgreSQL + RLS). Adicionalmente, se debía asegurar de que la estrategia elegida no añadiera fricción para los usuarios de la futura PWA Mobile.

## Desarrollo y Decisiones Arquitectónicas

### 1. Cambio de Estrategia a Subdominios
Originalmente, el sistema de Login dependía de un "Email Global Único". Al analizar el caso de uso del rubro indumentaria (alta rotación de empleados que rotan entre comercios), nos dimos cuenta de que impedir que un mismo email (`juan@gmail.com`) se use en dos sucursales de distintos clientes era una limitación de negocio grave.

Decidimos migrar de "Email Global" a **"Identificador por Subdominio"**.
*   **Implementación:** Se agregó la columna `Subdominio` (string, única) a la entidad `Inquilino`. 
*   **Resolución en Login:** El `AuthController` ahora primero busca el inquilino por el subdominio (`zara` de `zara.tusaas.com`). Una vez resuelto, busca las credenciales del email **exclusivamente dentro de ese inquilino**, permitiendo tener empleados con el mismo correo en distintos clientes en la misma base de datos.
*   **PWA Compatibility:** Las PWAs al ser instaladas anclan la app a un subdominio específico. El código de React fue preparado para abstraer automáticamente el `window.location.hostname`, por lo que el usuario en su celular solo tipea "Usuario y Contraseña", brindando la ilusión de una app 100% nativa de su empresa.

### 2. Infraestructura JWT y Seguridad
Se eliminó la dependencia empírica del header *inseguro* `X-Tenant-Id`.
*   **Hashing:** Se creó el servicio `PasswordHasher` (Inyectado como `IPasswordHasher`) basándose en `BCrypt.Net-Next` para asegurar las contraseñas en descanso.
*   **Firma JWT:** Se creó `JwtTokenGenerator`. Al loguear exitosamente a un usuario, el servidor incrusta como Claims el `tenantid`, `sub` (UserId) y `role`.
*   **Tenant Resolver Middleware:** Refactorizado para leer criptográficamente el `tenantid` directo del interior del JWT asegurado por firma HMAC. Esto protege retroactivamente todas las escrituras a PostgreSQL y auditorías.

### 3. Frontend de Pruebas
Se crearon en React (dentro de `features/auth`) los cimientos de estado:
*   Un `apiClient` global (Axios) con interceptores para inyectar automáticamente el header `Authorization: Bearer <token>`.
*   Un Store manejador de estados con `Zustand` interactuando y validando caducidad de claims mediante `jwt-decode`.
*   El `LoginScreen` que funge como protector visual. `router.tsx` está ahora protegido mediante un wrapper `<RequireAuth>`.

## Integración Continua (Estado Actual)
Ambas piezas (React Frontend y .NET Backend) compilan exitosamente. La migración `AddSubdominioToInquilino` fue aplicada limpiamente a PostgreSQL.

## Siguiente Fase
El sistema se encuentra blindado para soportar operaciones Multi-Tenant críticas. El próximo paso (Sprint 3) será desarrollar el "Corazón del Negocio": El Catálogo y la carga masiva matricial.
