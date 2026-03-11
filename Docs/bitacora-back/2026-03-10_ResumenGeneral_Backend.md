# Resumen General del Sistema (Backend)
**Rango de Fechas:** 24 de Febrero de 2026 — 10 de Marzo de 2026
**Propósito:** Proporcionar un panorama instantáneo del estado actual del sistema (API/C#/.NET 8 y PostgreSQL) a desarrolladores humanos e Inteligencias Artificiales integradas, delimitando módulos completados y su enfoque técnico.

---

## 🏗️ 1. Arquitectura y Seguridad Base
El corazón de la aplicación utiliza **Clean Architecture**. Todos los comandos y la persistencia están aislados para lograr un código mantenible a largo plazo.

- **Multi-tenancy Férreo:** El sistema es Súper-Multi-Tenant (`IMustHaveTenant`). Implementado mediante **Global Query Filters** en EF Core y **Row Level Security (RLS)** en PostgreSQL. El `TenantId` se inyecta vía JWT Middleware en cada transacción.
- **Auditoría Transparente:** Logs automáticos en formato `JSONB` a través de `AuditInterceptor` para cada operación de escritura.

## 🔐 2. Autenticación, Acceso y Features
- **Subdominios Dinámicos:** Acceso segmentado por identificador de subdominio, permitiendo colisión de emails entre diferentes tenants sin conflictos.
- **Seguridad JWT:** Emisión de tokens cifrados con `BCrypt` e inyección de Claims nativos para roles y configuración de rubro.
- **Feature Toggles Jerárquicos (SaaS 2.0 - Sprint 3):** Resolvedor de funcionalidades con caché L1 que permite activar módulos por Usuario > Sucursal > Inquilino > Rubro.
- **UI Mutante (SaaS 2.0 - Sprint 4):** El backend ahora provee `EsquemaMetadatosJson` durante el login, permitiendo que el frontend autoconfigure sus formularios.

## 🗃️ 3. Catálogo Inteligente y Carga Masiva
- **Matriz de Stock:** Arquitectura de Producto Padre y Variantes Hijas (Talle/Color) con propiedades dinámicas JSON.
- **Importación Batch (Sprint 4.3):** Soporte para carga masiva de hasta 500 productos por petición (`CrearProductosBatchCommand`), procesada bajo una única transacción ACID para garantizar integridad.
- **Control de Calidad:** Validaciones mediante `FluentValidation` integradas en el pipeline de MediatR (HTTP 400 automático ante incoherencias).

## 🛒 4. Punto de Venta (POS) y Stock Automatizado
- **Lógica Server-Side:** El servidor es la única fuente de verdad para precios y stock (`CobrarTicketCommand`). 
- **Sincronización de Inventario:** Descuento automático de stock tras ventas exitosas y reposición inmediata en caso de devoluciones.
- **Persistencia Histórica:** Bloqueo de borrado (`Restrict`) para variantes con historial de ventas para preservar la integridad contable.

## 👥 5. CRM, Saldos y Devoluciones (Sprint 4.2)
- **Cuenta Corriente Flexible:** Soporte de saldos a favor (+) y deudas (-) por cliente.
- **Motor de Devoluciones:** Lógica de "Balanza Mágica" que compensa valores entre prendas devueltas y nuevas adquisiciones, impactando el saldo del cliente y el stock físico en una sola operación transaccional.
- **Perfil 360:** Consultas optimizadas (Anti N+1) que entregan el historial de compras detallado del cliente.

## 📊 6. Gestión Financiera y Arqueo
- **Arqueo de Caja:** Soporte para cierres ciegos, historial de arqueos y trazabilidad de usuarios.
- **Reportes Financieros:** Endpoints dedicados para la obtención de métricas de rentabilidad y flujo de caja.

## 🧪 7. Calidad y Testing
- **Pruebas de Integración:** Suite completa con `xUnit` y `WebApplicationFactory` con base de datos en memoria para validaciones end-to-end de cada comando crítico.

---
*(Nota para desarrolladores/IAs: Las implementaciones concretas se encuentran en `Application/Features`. Consultar `Docs/bitacora-back/features` para detalles cronológicos específicos).*
