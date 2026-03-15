# Feature: Gestión de Equipo y Límites de Colaboradores (Backend)

**Fecha:** 2026-03-15 11:40
**Tipo de Cambio:** Nueva Función
**Tags:** #Modulo_Equipo, #Nivel_Seguridad, #Area_Backend, #Importancia_Critica

## Descripción
Se ha implementado la infraestructura de backend para permitir que los dueños de negocios gestionen a sus colaboradores (empleados). Esto incluye la creación de cuentas, asignación de roles y control granular de permisos por módulo.

## Detalles Técnicos
- **Controlador**: `EquipoController` protegido con `[Authorize(Roles = "Owner")]`.
- **Casos de Uso (MediatR)**:
    - `ObtenerEquipoQuery`: Recupera los usuarios del tenant actual.
    - `CrearColaboradorCommand`: Registra nuevos usuarios.
    - `ActualizarPermisosColaboradorCommand`: Persiste la configuración de permisos en el campo `FeaturesJson` del usuario.
- **Regla de Negocio**: Se validó el límite de **1 colaborador gratuito** en el comando de creación. Si el conteo de usuarios (excluyendo Owners) llega a 1, se bloquean nuevos registros hasta un upgrade de plan.
- **Seguridad**: Se utiliza `IPasswordHasher` para el resguardo de claves de empleados y `EnterBypassMode()` para validar la unicidad global del email.

## Impacto en Multi-tenancy
El aislamiento está garantizado por el Global Query Filter de la entidad `Usuario`. Ningún dueño puede ver o crear empleados para otros tenants. La lógica de permisos afecta directamente al `FeatureResolver`, permitiendo que el empleado solo vea los módulos que el dueño autorizó.

## Explicación Didáctica
Imaginalo como si el dueño del negocio ahora tuviera un "Libro de Firmas" y un "Llavero":
1.  **El Libro de Firmas (`CrearColaborador`)**: Permite anotar el nombre de quien va a trabajar en el local. Pero pusimos una regla: el libro solo tiene espacio para 1 empleado gratis; si querés anotar un segundo, tenés que comprar un libro más grande.
2.  **El Llavero (`ActualizarPermisos`)**: El dueño puede elegir qué llaves entregarle a cada empleado. Si le quita la llave de "Ventas", el empleado no podrá ni abrir la puerta de ese módulo en el sistema.

Archivos clave:
- `UsuariosController.cs`: El mostrador que recibe los pedidos de gestión.
- `CrearColaboradorCommand.cs`: El guardia que revisa si queda lugar en el equipo antes de dejar pasar a alguien nuevo.
- `Usuario.cs`: La ficha personal donde se anotan los permisos de acceso.
