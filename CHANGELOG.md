# Changelog

Todos los cambios notables en el ecosistema **Indumentaria-SaaS** serán documentados en este archivo. El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y este proyecto adhiere a la gestión de versiones por hitos de Sprint.

## [Desplegado] - 2026-03-16
### Added
- **Núcleo Multi-Sucursal**: Soporte nativo para múltiples sedes físicas vinculadas al flujo de inventario y ventas.
- **Selector de Sucursal Dinámico**: Rediseño del header global con persistencia de sede en Zustand y envío automático del header `X-Sucursal-Id`.
- **Gestión de Equipo**: Implementación de `EquipoController` con validación de límites de plan y administración granular de permisos vía `FeaturesJson`.
- **Acceso Rápido por PIN**: Sistema de PIN Pad táctil para cambio inmediato de operador sin cerrar sesión global, emitiendo tokens JWT específicos.
- **Framework UX/UI Educativa**: Implementación de estados vacíos accionables y sistema de `Toast` global con soporte para **Undo**.
- **Aislamiento de Rubro (Ferretería)**: Identidad visual propia para ferreterías, ocultando campos de indumentaria (Temporada) y mutando terminología técnica (Talles -> Medidas).
- **Reportes de Inteligencia (Ferretería)**: Implementación de `AgingReport` (Morosidad > 30 días) y `CajaDetalleFerreteria` con separación de flujos (Ventas vs Cobranza CC).
- **PWA Hardware Sync**: 
    - **Barcode Detector API**: Escaneo ultra-rápido (>5 fps) delegando el procesamiento a la NPU/GPU nativa.
    - **Web Share Target**: Integración con el menú nativo del SO para recibir imágenes/links vía el router `/shared-product`.
    - **File System Access API**: Uso de `showSaveFilePicker()` para enrutamiento manual de PDFs de etiquetas.

### Changed
- **Motor de Localización**: Migración a transporte de diccionarios en **Base64** para garantizar estabilidad con caracteres especiales UTF-8 en los headers HTTP.
- **Estrategia de Creación**: Refactorización completa de `CrearProductoConVariantesCommandHandler` utilizando el patrón **Strategy** (`ICreadorProductoStrategy`).
- **Nomenclatura Vernacular**: Reemplazo de etiquetas estáticas por el motor `t()` en Catálogo y POS para soporte multi-idioma de negocio.

### Fixed
- **Integridad Contable**: Bloqueo de borrado físico (`Restrict`) para variantes de producto que posean historial de ventas.
- **Sincronización de Headers**: Corrección de fallos en el interceptor de `apiClient` al decodificar metadatos de rubro en navegadores móviles.

## [2.0.0-beta] - 2026-03-10
### Added
- **UI Mutante (Metadata-Driven)**: Implementación de `FieldFactory` en React que construye formularios dinámicamente basados en un **Schema Registry** (JSON) del backend.
- **PostgreSQL RLS**: Implementación de **Row Level Security** nativo para blindaje de datos Multi-Tenant, sustituyendo los Global Query Filters de EF Core.
- **Capacidades PWA Avanzadas**: Escaneo de códigos vía GPU (`BarcodeDetector`), integración con Share Target del SO y File System Access API.
- **Sistema de Impresión 3-Tier**: Soporte universal para térmicas vía **Web Serial**, **Web Bluetooth** y fallback automático a **jsPDF**.
    - **Safe-Zone Engine**: Implementación de padding de 3mm y `border-box` para absorber desvíos mecánicos en rollos térmicos.
    - **Y-Position Tracking**: Motor de paginación inteligente en `jsPDF` que evita el recorte de etiquetas entre hojas A4/A3.
    - **Dynamic CSS Injection**: Inyección de reglas `@page` en tiempo real según el ancho del insumo (58mm, 80mm, etc.).
- **CRM 360**: Billetera digital de clientes con soporte para saldo a favor, deudas y motor de devoluciones ("Balanza Mágica").
- **Importación Batch**: Motor de carga masiva de hasta 500 productos por transacción ACID con mapeo dinámico a **JSONB** e índices **GIN**.

### Security
- **Aislamiento por Subdominio**: Lógica de resolución de inquilino por URL, permitiendo colisión segura de emails entre diferentes empresas.
- **JWT Middleware**: Inyección obligatoria de `TenantId` resuelto desde el token en todas las transacciones de base de datos.

## [1.0.0] - 2026-02-24
### Added
- **Arquitectura Base**: Implementación de **Clean Architecture** en .NET 8 y PostgreSQL.
- **Catálogo Core**: Estructura de Producto Padre y Variantes (Talle/Color).
- **POS Inicial**: Punto de venta con sincronización de stock server-side.
- **Autenticación**: Sistema de login con BCrypt y roles básicos (Owner, Admin, Cajero).
