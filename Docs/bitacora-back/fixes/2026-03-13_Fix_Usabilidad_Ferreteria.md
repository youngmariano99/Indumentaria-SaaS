# Fix: Refinamiento Multi-rubro y Ajustes de Usabilidad (Ferretería)

**Fecha:** 2026-03-13
**Sprint:** 6 - Arqueos y Explotación Financiera (Fixes)

## Descripción
Se han corregido problemas de usabilidad reportados por el usuario relacionados con la persistencia del rubro y la visualización de formularios incorrectos.

## Cambios Realizados

### Backend
- **Controlador de Rubros:** Creado `RubrosController` para exponer la lista de rubros activos al frontend durante el registro.
- **Base de Datos:** Implementada migración `PopulateRubroSlugs` para asegurar que todos los rubros tengan su identificador de URL (`Slug`) poblado (`indumentaria`, `ferreteria`).
- **Seguridad:** Eliminado bloque de código temporal en `Program.cs` para la población de slugs, reemplazándolo por la migración definitiva.

### Frontend
- **Registro:** La página de registro ahora carga los rubros dinámicamente desde el servidor, evitando IDs erróneos o harcodeados.
- **Configuración:** En `AjustesPage`, se oculta la pestaña de "Talles de Indumentaria" cuando el rubro del tenant no es indumentaria, evitando confusiones.
- **Cuenta de Usuario:** Agregada información visual del rubro actual en la página `Mi cuenta`.
- **Navegación y Estilos:** Corregidos errores de importación de CSS Modules en `AccountPage`.

## Impacto
- El usuario de ferretería ahora ve el formulario de carga de productos correcto (según `FerreteriaSchemaRegistry`).
- Se eliminó el "ruido visual" de talles de ropa en negocios que no los utilizan.
- Mayor claridad para el usuario sobre en qué vertical del SaaS está operando.
