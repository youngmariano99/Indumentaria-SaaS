# Resumen General del Sistema (Backend)
**Rango de Fechas:** 24 de Febrero de 2026 — 16 de Marzo de 2026
**Propósito:** Proporcionar un panorama instantáneo del estado actual del sistema (API/C#/.NET 8 y PostgreSQL) a desarrolladores humanos e Inteligencias Artificiales integradas, delimitando módulos completados y su enfoque técnico.

---

## 🏗️ 1. Arquitectura y Seguridad Base
El corazón de la aplicación utiliza **Clean Architecture**. Todos los comandos y la persistencia están aislados para lograr un código mantenible a largo plazo.

- **Multi-tenancy Férreo:** El sistema es Súper-Multi-Tenant (`IMustHaveTenant`). Implementado mediante **Global Query Filters** en EF Core y **Row Level Security (RLS)** en PostgreSQL. El `TenantId` se inyecta vía JWT Middleware en cada transacción.
- **Auditoría Transparente:** Logs automáticos en formato `JSONB` a través de `AuditInterceptor` para cada operación de escritura.

## 🔐 2. Autenticación, Acceso y Features
- **Subdominios Dinámicos:** Acceso segmentado por identificador de subdominio, permitiendo colisión de emails entre diferentes tenants sin conflictos.
- **Seguridad JWT:** Emisión de tokens cifrados con `BCrypt` e inyección de Claims nativos para roles y configuración de rubro.
- **Multi-Rubro Nativo (Sprint 2 & 10):** Motor de localización dinámico (`DiccionarioRubroMiddleware`) que inyecta términos técnicos (ej: "Medida" vs "Talle") en los encabezados de respuesta.
- **Robustez de Headers:** Implementación de codificación **Base64** para el transporte de diccionarios con caracteres especiales (UTF-8), garantizando estabilidad ante términos técnicos complejos.
- **Feature Toggles Jerárquicos (Sprint 3):** Resolvedor de funcionalidades con caché L1 que permite activar módulos por Usuario > Sucursal > Inquilino > Rubro.
- **UI Mutante (Sprint 4 & 8):** El backend provee `ISchemaRegistry` durante el flujo de trabajo, permitiendo que el frontend autoconfigure sus formularios y validaciones según la industria (Ferretería, Indumentaria, etc.).

## 🗃️ 3. Catálogo Inteligente y Carga Masiva
- **Matriz de Stock:** Arquitectura de Producto Padre y Variantes Hijas (Talle/Color) con propiedades dinámicas JSON.
- **Patrón Estrategia (Sprint 7):** Desacoplo total de la lógica de negocio mediante `ICreadorProductoStrategy` y `IValidadorProducto`, permitiendo que el Core sea agnóstico al rubro mientras las capas verticales definen el comportamiento específico.
- **Importación Batch (Sprint 4.3):** Soporte para carga masiva de hasta 500 productos por petición, procesada bajo una única transacción ACID.
- **Control de Calidad:** Validaciones mediante `FluentValidation` integradas en el pipeline de MediatR (HTTP 400 automático ante incoherencias).

## 🛒 4. Punto de Venta (POS) y Stock Automatizado
- **Lógica Server-Side:** El servidor es la única fuente de verdad para precios y stock (`CobrarTicketCommand`). 
- **Sincronización de Inventario:** Descuento automático de stock tras ventas exitosas y reposición inmediata en caso de devoluciones.
- **Integración con Proveedores:** El registro de facturas de compra ahora dispara el incremento automático de stock en las variantes vinculadas y actualiza el costo de reposición de forma atómica.
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

## 🏢 8. Gestión de Equipo y Multi-Sucursal (Marzo 2026)
- **Administración de Colaboradores:** Implementación de `EquipoController` para gestión de personal con **validación de límites de plan** (1 empleado gratis). 
- **Control Granular de Permisos:** Almacenamiento de permisos por módulo en `FeaturesJson` integrado con el motor de funcionalidades para restringir acceso según la asignación del Dueño.
- **Cambio Rápido de Turno:** Sistema de autenticación por **PIN de 4 dígitos** que facilita la rotación de cajeros sin cerrar la sesión global, emitiendo tokens JWT específicos.
- **Núcleo Multi-Sucursal:** Soporte nativo para múltiples sedes físicas vinculadas al flujo de inventario y ventas. Se implementó la validación comercial mediante el feature toggle `Multisucursal`.

---
*(Nota para desarrolladores/IAs: Las implementaciones concretas se encuentran en `Application/Features`. Consultar `Docs/bitacora-back/features` para detalles cronológicos específicos).*
