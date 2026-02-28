# Resumen General del Sistema (Backend)
**Rango de Fechas:** 24 de Febrero de 2026 — 28 de Febrero de 2026
**Propósito:** Proporcionar un panorama instantáneo del estado actual del sistema (API/C#/.NET 8 y PostgreSQL) a desarrolladores humanos e Inteligencias Artificiales integradas, delimitando módulos completados y su enfoque técnico.

---

## 🏗️ 1. Arquitectura y Seguridad Base (Sprints 1 y 2)
El corazón de la aplicación utiliza **Clean Architecture**. Todos los comandos y la persistencia están aislados para lograr que un código mantenible a largo plazo.

- **Multi-tenancy Férreo:** El sistema es Súper-Multi-Tenant. Está garantizado mediante `IMustHaveTenant` en entidades, **Global Query Filters** en EF Core que imponen `Donde TenantId = Tú`, y **Row Level Security (RLS)** a nivel base de datos PostgreSQL. Todo Request intercepta el JWT del cliente extrayendo el Tenant (vía Middleware) inyectándolo en las transacciones para evitar fugas inter-clientes.
- **Auditoría Transparente:** La base de datos graba logs automáticamente en formatos `JSONB` a través del `AuditInterceptor` (EF Core) para monitorear cada UPDATE o DELETE.

## 🔐 2. Autenticación, Subdominios y Auth (Sprint 2.1)
- Acceso por **Identificador de Subdominio** (`tienda.saas.com`) en vez de "Email Único Global", de modo que los cajeros puedan repetir correos sin colapsar inquilinos ajenos.
- Endpoints `Auth/Login` emitiendo JWT cifrados (`BCrypt`) con inyección de Claims nativos (ej: `tenantid`, `sub` de usuario/rol).

## 🗃️ 3. Catálogo Inteligente y Matriz de Stock (Sprint 3)
La arquitectura de inventario simula a titanes como Amazon o MercadoLibre.
- **Producto Padre y Variantes Hijas:** Una "Remera" abstracta despliega automáticamente 16 *VariantesMaterializadas* (Talles S,M,L,XL cruzado con Colores). Carga de stock inicial. Esto está mapeado con consultas Anti N+1 (`ObtenerCatalogoQuery`) permitiendo descargar miles de productos ultra-rápido al frontend.
- **Flexibilidad:** Tablas con propiedades dinámicas JSON en vez de columnas duras. `VarianteProducto.AtributosJson` permite que calzados tengan `{"suela": "tapones"}` o camperas `{"Temporada":"Invierno"}` sin destruir esquemas relacionales.
- **Micro-Ajustes por Tenant:** Cada dueño edita su propia tirada de Talles o Tags (por ejemplo: Ropa de Trabajo tiene talles diferentes a Ropa Interior).
- **Control de Calidad (Pipeline MediatR + FluentValidation):** Antes de grabar cosas en la Base de Datos, las requests atraviesan _Pipelines_ validando coherencia (p.e: rebota HTTP 400 si intentás meter un precio negativo o texto falso).

## 🛒 4. Punto de Venta / Módulo Financiero POS (Sprint 4)
Caja registradora transaccional 100% resistente enfocada a "Single Source of Truth" del Servidor.
- **Entidades Registrales:** `Venta`, `VentaDetalle` y `MetodoPago`. 
- **Lógica Incorruptible (Server-Side):** El frontend nunca calcula precios reales. Envía el carrito, y el backend lee forzosamente los precios de PostgreSQL originarios (`CobrarTicketCommand`). La Venta se encapsula en una gran transacción ACID (`BeginTransactionAsync`). Si algo falla al final, se hace *Rollback* automático.
- **Modificadores Fiscales Básicos:** Cómputo global de Descuentos (%) o Recargos aplicados al Subtotal.
- **Historial Seguro:** La tabla guarda el `PrecioUnitarioAplicado` como una foto histórica. Además se aplica borrado a nivel DB `DeleteBehavior.Restrict` (Jamás se puede borrar una Variante del sistema si ya fue vendida en el pasado).

## 🧪 5. Testing Empaquetado
El proyecto ya posee un marco de Pruebas de Integración (`xUnit`, `FluentAssertions`) que simula el ciclo de vida del Servidor con una base de datos temporal cargada en RAM (`WebApplicationFactory`). Todos los comandos escritos se comprueban end-to-end antes del push.

---
*(Nota para nuevas IAs: Las implementaciones concretas pueden ser encontradas en `Application/Features` dentro de su respectivo módulo, y la configuración técnica profunda en `Docs/bitacora-back/features` o `Docs/desarrollo`).*
