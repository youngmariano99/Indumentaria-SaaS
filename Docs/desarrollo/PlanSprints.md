# 🚀 Plan de Sprints: SaaS Punto de Venta Indumentaria ARG

A continuación se detalla el plan maestro (End-to-End) de todos los Sprints necesarios para llevar el sistema desde cero a producción, respetando estrictamente la Clean Architecture y los pilares marcados en la Guía de Desarrollo.

---

## Sprint 1: Fundación y Dominio Base (Completado)
**Fechas:** 24/02/2026
**Objetivo:** Establecer la columna vertebral del proyecto de software (Carpetas, Soluciones y Abstracciones).

*   [x] Creación de solución `.NET 8` limpia con separación `Core`, `Application`, `Infrastructure` y `API`.
*   [x] Creación de entorno de `React/Vite` estructurado por *Features* (Features-sliced).
*   [x] Generación del "Protocolo de Documentación Obligatorio" (`Docs/GuiaDesarrollo.md`).
*   [x] Creación de entidades C# en español neutro (Inquilino, Producto, LogFiscal) con soporte a la interfaz `IMustHaveTenant`.
*   [x] Primer documento de trazabilidad generado en `/docs/arquitectura/`.

---

## Sprint 2: Infraestructura, Persistencia y Multi-tenancy (Completado)
**Fecha de Finalización:** 25/02/2026
**Objetivo:** Conectar el Backend de .NET a PostgreSQL garantizando la invulnerabilidad de los datos entre inquilinos.

*   [x] Configurar `ApplicationDbContext` (Entity Framework Core) con PostgreSQL.
*   [x] Implementar **Global Query Filters** automáticos mapeados a `IMustHaveTenant`.
*   [x] Implementar Middleware en la `API` (`TenantResolverMiddleware`) para capturar el Tenant del JWT actual (Simulado vía Header temporalmente).
*   [x] Activar Row Level Security (RLS) directamente desde migraciones PostgreSQL.
*   [x] Implementar interceptor para `LogAuditoria` en EF (grabado automático de cambios en JSONB).

---

## Sprint 2.1: Identidad y Accesos (Completado)
**Fecha de Finalización:** 25/02/2026
**Objetivo:** Implementar un sistema de Login seguro que emita Tokens JWT con Claims de Tenant, permitiendo que la auditoría y el RLS funcionen con usuarios reales.

*   [x] **Core:** Definir Entidades `Usuario`, `Rol` y actualizar `Inquilino` con `Subdominio`.
*   [x] **Infraestructura:** Implementar servicio de Hash de contraseñas (BCrypt).
*   [x] **Infraestructura:** Implementar `JwtTokenGenerator` para emitir tokens firmados (inyectando claims de `tenantid`).
*   [x] **API:** Endpoints de `Auth/Login` y `Auth/Register` (Solo para Admin temporal).
*   [x] **Middleware:** Refactorizar `TenantResolverMiddleware` para leer `TenantId` desde los Claims del JWT y hacer enforcing del RLS.
*   [x] **Frontend:** Pantalla de Login en React con abstracción automática del subdominio de la URL y Store en Zustand.

## Sprint 3: Catálogo, Matriz de Stock y "El Corazón" del Negocio
**Fechas Estimadas:** Del 04/03/2026 al 15/03/2026
**Objetivo:** Evitar el "inventario fantasma" implementando la estructura Producto y Variante.

*   [ ] **Backend:** Casos de uso (Mediator Commands/Queries) para Carga rápida de Productos y sus variantes (Talle/Color).
*   [ ] **Backend:** Reglas de validación pura con FluentValidation.
*   [ ] **API:** Endpoints REST asegurados para catálogos.
*   [ ] **Frontend:** Componente de carga visual matricial ("Bulk Import"). Formularios optimizados de React Hook Form.

---

## Sprint 4: Punto de Venta (POS) Offline-First "Zona del Pulgar"
**Fechas Estimadas:** Del 16/03/2026 al 31/03/2026
**Objetivo:** Desarrollar la principal interfaz operativa del empleado de sucursal.

*   [ ] **Frontend:** UI/UX en apaisado para tablets, enfocando las acciones de la mano.
*   [ ] **Frontend:** Configuración de Base de Datos Local (RxDB o WatermelonDB) para guardar precios, productos y clientes sin red.
*   [ ] **Frontend:** Generación y encolamiento de tickets transitorios (Background Worker + SyncManager).
*   [ ] **Frontend (Autenticación):** Acceso rápido seguro vía PIN para Alta Rotación (`PinCodeHash`).

---

## Sprint 5: Módulo Fiscal Crítico y Resiliencia (Módulo ARCA)
**Fechas Estimadas:** Del 01/04/2026 al 15/04/2026
**Objetivo:** Orquestar de manera legal y robusta la comunicación en tiempo real con ARCA.

*   [ ] **Backend:** Integración WSFE v1 y WSFEX vía .NET Source Generators XML (desempeño y compatibilidad SOAP).
*   [ ] **Backend:** Resiliencia (Backoff Exponencial y función automática de recuperación CAEA / Fortaleza `FECompUltimoAutorizado`).
*   [ ] **Seguridad:** Gestión de certificados crudos del Tenant vía _Azure Key Vault_.
*   [ ] **Backend:** Serialización mandatoria a Base de Datos en columnas `LogFiscal.RequestJson` / `ResponseJson` para peritajes.

---

## Sprint 6: Módulos Monetizables (Wallet y Multi-Sucursal)
**Fechas Estimadas:** Del 16/04/2026 al 30/04/2026
**Objetivo:** Habilitar a demanda las funciones que incrementan el MRR (ingresos recurrentes).

*   [ ] **Backend:** Feature Flags en capa *Application* basados en la data de `ModuloSuscripcion`.
*   [ ] **Backend/API:** Motor de transacciones seguras (Debit/Credit) para el Módulo C: Billetera Virtual y acreditación de Notas de Crédito al cliente.
*   [ ] **Frontend:** Interfaz de visibilidad global entre sucursales y traspaso con doble confirmación.

---

## Sprint 7: Telemetría, Facturación y Testing de Punta a Punta
**Fechas Estimadas:** Del 01/05/2026 al 10/05/2026
**Objetivo:** Disponer del sistema de uso medido para cobrar los "adicionales" a suscriptores, y certificar el software.

*   [ ] **Backend:** Middleware / Action Filters para medir el "Uso" (Facturas autorizadas, Prendas creadas) e impactar contadores eficientemente en Redis -> PostgreSQL.
*   [ ] **QA:** Creación de Unit Tests de alto valor (facturas complejas).
*   [ ] **Despliegue:** Contenedores (Docker) y configuraciones de CI/CD para producción.
