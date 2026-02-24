# Tags
#Modulo_Arquitectura
#Importancia_Critica
#Area_Backend
#Nivel_Seguridad_Base

# Construcción de Estructura de Proyecto y Entidades Core

**Fecha y Hora:** 2026-02-24 18:25 (hs GMT-3)
**Tipo de Cambio:** Nueva Función / Configuración Base Arquitectónica

## 1. Contexto y Propósito
Se abordó el "derecho a jugar" tecnológico del ecosistema Retail POS: la fundación sobre la que descansa el Multi-tenancy, Clean Architecture y las vistas del Frontend. El propósito principal fue automatizar la creación de la estructura limpia en `.NET 8` (Backend) y Vite/React (Frontend) para garantizar la separación de conceptos descrita en la Arquitectura aprobada.
También se establecieron las bases de Dominio en C# (Entidades, Interfaces y Enumeraciones), empleando nomenclatura "Con Cancha" (castellano latinoamericano) para asegurar familiaridad con el lenguaje del negocio de Argentina (ARCA, IVA, Remito, Inquilino, Variante).

## 2. Lógica y Estructura Generada
*   **Frontend:** Estructura basada en Features (Auth, POS, Catalog, Fiscal, Wallet) preparada para `LocalDb` y Offline-First.
*   **Backend:** Solución `puntoVentaInd.sln` dividida férreamente en `Core`, `Application`, `Infrastructure` y `API`.
*   **Entidades y Enumeraciones:** Clases que heredan de un concepto de base (`BaseEntity`) para tener Identidad (`Id` global Guid), y un contrato de pertenencia a un inquilino a través de `IMustHaveTenant`.

## 3. Impacto en Multi-tenancy
**Alto.** La creación de la interfaz `IMustHaveTenant` obliga, a nivel contractual de C#, a que entidades de acceso sensible (Inquilino, Comprobante, Cliente, Inventario, LogFiscal, etc.) definan obligatoriamente la propiedad `TenantId` (Guid).
Esto es la piedra angular para lo que, en los siguientes sprints, se materializará como los `Global Query Filters` de Entity Framework Core, garantizando que todo query anexe transparente y automáticamente un predicado `WHERE TenantId = @id_actual`.

## 4. Detalle Técnico
### Cambios y Ejecuciones C# / Backend:
*   Se crearon las entidades clave: `Inquilino`, `Sucursal`, `Producto`, `VarianteProducto`, `Inventario`, `Comprobante`, `LogFiscal`, `Cliente`, `LogAuditoria`, etc.
*   El lenguaje fuente respeta la convención de *Ubiquitous Language* en español (Ej. `VarianteProducto.PrecioModificado` en lugar de `ProductVariant.PriceOverride`).

### Infraestructura (Pendiente de implementación concreta):
El diseño estructural dejó preparadas las carpetas `Infrastructure/Persistence/Interceptors` e `Infrastructure/ExternalServices/ARCA` listas para inyectar allí las clases de bases de datos PostgreSQL y clientes SOAP en futuros commits.
