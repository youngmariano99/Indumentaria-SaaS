# Feature: Interfaz de Gestión de Equipo (Frontend)

**Fecha:** 2026-03-15 11:45
**Tipo de Cambio:** Nueva Función
**Tags:** #Modulo_Equipo, #Area_Frontend, #UX_Educativa

## Descripción
Se desarrolló la interfaz de usuario para que el dueño del negocio pueda administrar a sus colaboradores de forma intuitiva, alineada con los principios de UX Educativa y el Design System del proyecto.

## Detalles Técnicos
- **Página Principal**: `EquipoPage.tsx` con una tabla de colaboradores que muestra el rol y los módulos activos.
- **Gestión de Datos**: Implementación de `useEquipo` mediante `@tanstack/react-query` para sincronización optimista y manejo de estados de carga.
- **Modal de Alta**: `ModalNuevoColaborador.tsx` que facilita la creación de accesos con selección de rol simplificada.
- **Panel de Permisos**: `PanelPermisos.tsx` con checkboxes interactivos para activar/desactivar módulos (Ventas, Catálogo, Proveedores, etc.).
- **Navegación**: Inclusión de la ruta `/equipo` protegida por rol en el sidebar lateral.

## UX Educativa
- Se incluyó un banner informativo notificando al usuario sobre el límite de **1 colaborador gratuito**, evitando frustraciones al intentar crear más usuarios.
- El panel de permisos utiliza un lenguaje vernacular ("Permitir realizar cobros", "Ver deudas de clientes") en lugar de términos técnicos, facilitando la comprensión para usuarios sin experiencia tecnológica.

## Explicación Didáctica
Hemos creado la "Oficina del Jefe" dentro de la web:
1.  **Página de Equipo**: Es un tablero donde el jefe ve a todos sus empleados de un solo vistazo.
2.  **Modal de Alta**: Es como entregarle el uniforme y la contraseña al empleado nuevo.
3.  **Panel de Permisos**: Es un panel con interruptores (On/Off). Si el jefe apaga el interruptor de "Caja", esa parte de la tienda desaparece para el empleado, manteniéndolo enfocado solo en lo que debe hacer.

Archivos clave:
- `equipoApi.ts`: El mensajero que lleva las órdenes del jefe al servidor.
- `EquipoPage.tsx`: La vista general del personal.
- `PanelPermisos.tsx`: El configurador de accesos por módulos.
