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

## Sprint 3: Catálogo, Matriz de Stock y "El Corazón" del Negocio (Completado)
**Fecha de Finalización:** 27/02/2026
**Objetivo:** Evitar el "inventario fantasma" implementando la estructura Producto y Variante.

*   [x] **Backend:** Casos de uso (Mediator Commands/Queries) para Carga rápida de Productos y sus variantes (Talle/Color).
*   [x] **Backend:** Reglas de validación pura con FluentValidation.
*   [x] **API:** Endpoints REST asegurados para catálogos (`POST /api/productos/matrix`, `GET /api/productos`).
*   [x] **Frontend:** Componente de carga visual matricial con generación reactiva de variantes (Talle × Color → chips).
*   [x] **Frontend:** Grilla de visualización del catálogo con cards de productos, chips de variantes y barra de estadísticas.
*   [x] **Integración:** CORS configurado, puerto corregido, Login y Registro conectados al backend real.

---

## Sprint 3.1: Testing Automatizado del Backend (Integration & Unit) (Completado)
**Fechas Estimadas:** Del 16/03/2026 al 20/03/2026
**Objetivo:** Establecer una malla de seguridad con tests automáticos para los módulos críticos (Autenticación y Catálogo) asegurando que futuras modificaciones no rompan lo existente.

*   [x] **Infraestructura de Tests:** Configurar `WebApplicationFactory` con base de datos en memoria o Testcontainers para pruebas de integración reales sin ensuciar la BD principal.
*   [x] **Tests de Dominio (Unit):** Validar comportamientos puros de las entidades `Core`.
*   [x] **Tests de Integración (API):** Casos de prueba para endpoints críticos (`POST /api/auth/login`, `POST /api/productos/matrix`). Uso de `xUnit` y `FluentAssertions`.
*   [x] **Limpieza y Orden:** Estructurar la carpeta `/tests` manteniendo una nomenclatura estricta y clara (`FeatureTests/Modulo...`).

---

## Sprint 3.2 — Parte 1: Tipos, Stock y Configuración por Tenant (Completado)
**Fecha de Finalización:** 27/02/2026
**Objetivo:** Solidificar el módulo de catálogo con tipos de producto, stock inicial real, layout compartido y configuración personalizable de talles.

*   [x] **Backend:** Enum `TipoProducto` (Ropa, Calzado, Accesorio, Ropa Interior, Deporte, Ropa de Trabajo).
*   [x] **Backend:** Campo `TipoProducto` en entidad `Producto`. Migración EF: `AddTipoProductoYStockInicial`.
*   [x] **Backend + BD:** Stock inicial por variante: al crear variantes, se crean registros en tabla `Inventario` con `StockActual = stockInicial`.
*   [x] **Backend:** Endpoints `GET /api/ajustes/talles` y `PUT /api/ajustes/talles` para configuración personalizada por tenant. Migración `AddConfiguracionTallesJson`.
*   [x] **Frontend:** `AppLayout` compartido con sidebar/nav que persiste en todas las rutas protegidas. Router refactorizado con `ProtectedLayout + Outlet`.
*   [x] **Frontend:** Selector de tipo de producto en el formulario de carga con pre-carga automática de talles según tipo.
*   [x] **Frontend:** Columna de stock inicial en la tabla matricial de variantes.
*   [x] **Frontend:** Página `/ajustes` (Configuración) con editor de chips de talles por tipo, persistida en el backend.

---

## Sprint 3.2 — Parte 2: Flexibilidad del Formulario de Carga (Completado)
**Fecha de Finalización:** 27/02/2026
**Objetivo:** Hacer el formulario de carga de productos más potente y flexible para cubrir casos reales de indumentaria.

*   [x] **Fix — Layout duplicado:** Eliminado el sidebar embebido en `CatalogoPage.tsx` que quedó del estado anterior al `AppLayout`.
*   [x] **Temporada opcional:** El campo "Temporada" pasó a ser opcional. Primera opción "Sin temporada asignada" (valor vacío). No bloquea el guardado.
*   [x] **Eliminar filas de la matriz:** Botón 🗑️ (Trash) en cada fila de la tabla de variantes. Genera la matriz completa Talle × Color y el usuario elimina las combinaciones que no necesita.
*   [x] **Atributos adicionales por variante:** Nueva sección "Atributos adicionales" con pares Clave/Valor libres (ej: `Uso: F11`, `Material: Cuero`). Se guardan como JSON en `VarianteProducto.AtributosJson`. Se pre-cargan desde la configuración del tenant.
*   [x] **Backend:** `VarianteProducto.AtributosJson` (columna JSON) e `Inquilino.ConfiguracionAtributosJson`. Migración `AddAtributosJsonYConfiguracionAtributos` aplicada a PostgreSQL.
*   [x] **Backend:** Endpoints `GET /api/ajustes/atributos` y `PUT /api/ajustes/atributos` para gestionar atributos predefinidos por tipo.
*   [x] **Frontend:** `ajustesApi` extendido con `obtenerAtributos` / `guardarAtributos`. Los atributos del tipo se pre-cargan al cambiar tipo de producto en el formulario.

---

## Sprint 3.2 — Parte 3: Escalas de Talles Internacionales (Completado)
**Fechas Estimadas:** Post Sprint 4 (POS)
**Objetivo:** Soporte para productos importados con escalas de talles de otros países.

*   [x] **Ajustes — País de operación por defecto:** El tenant elige su país base (Argentina, Europa, USA, etc.). Los talles pre-cargados se adaptan a esa escala.
*   [x] **Formulario de carga — Escala de talles por producto:** Desplegable por producto para elegir la escala de talles (AR, EU, US, UK, BR). Útil para ropa importada que viene con talles del país de origen.
*   [x] **Tabla de conversión:** Mapeo base entre escalas (ej: EU 38 = AR 38 = US 7.5) como referencia visual para el operador. No convierte automáticamente — muestra la equivalencia.
*   [ ] Referencia: `Docs/indicacionesIA/Talles.md`.

---

## Sprint 3.4: ABM de Catálogo Completo (Edición y Baja Lógica) (Completado)
**Objetivo:** Permitir la modificación de precios y la ocultación de productos (baja lógica) sin destruir el historial contable de ventas pasadas. Requisito estricto antes de lanzar al público.

*   [x] **Backend:** Interfaz `ISoftDelete` en `Producto` y `VarianteProducto` con Global Query Filter asociado.
*   [x] **Backend:** Comandos y Endpoints `PUT /api/productos/{id}` y `DELETE /api/productos/{id}`.
*   [x] **Frontend:** Adición de botones Editar/Eliminar en las cards del Catálogo.
*   [x] **Frontend:** Re-utilización de `NuevoProductoPage` para inicializarse con datos existentes (Modo Edición).

---

## Sprint 3.5: Catálogo Avanzado (Completado)
> Estas funcionalidades requieren migraciones complejas y rediseño profundo. Se implementan luego del POS y solo si hay demanda real de clientes.

*   [x] **Categorías Jerárquicas con NCM:** Tabla de categorías con código NCM del MERCOSUR para automatizar tributación y comercio exterior.
*   [x] **Atributos Dinámicos EAV:** Tablas `DefinicionAtributos` y `MapeoAtributosCategoria` para campos propios por categoría (Copa/Contorno para Ropa Interior, Tipo de Suela para Calzado, etc.).
*   [x] **Activación de Atributos por Tenant:** Un local de ropa de oficina ve solo categorías formales; un local deportivo ve Deporte + Athleisure.
*   [x] **Metadata de Logística por SKU:** Peso, dimensiones, GTIN/EAN-13, País de Origen, Composición de fibra para integración con e-commerce y aduanas.
*   [ ] **Packs y Bundles:** Soporte para "Pack SKU Único", "Virtual Bundle" y "Pre-packs Mayoristas" (curvas de talles).
*   [x] **Edición y Eliminación de Productos:** Endpoint `PUT /api/productos/{id}` y `DELETE` con baja lógica para preservar historial de ventas.

---

## Sprint 4: Punto de Venta (POS) - Conexión Back/Front (FINALIZADO)
**Fecha de Finalización:** 28/02/2026
**Objetivo:** Desarrollar la principal interfaz operativa del empleado de sucursal y conectarla a la base de datos central.

*   [x] **Backend:** Extensión de la entidad `Venta` para soportar `Subtotal`, `Descuento` y `Recargo`. Migración de base de datos aplicada.
*   [x] **Backend:** Módulo CQRS para cobrar tickets (`CobrarTicketCommand`) con re-validación matemática segura en el lado del servidor.
*   [x] **Backend:** Endpoints para recabar Catálogo Posificado rápidos y listado de Metodos de Pago (Efectivo, Tarjeta, Débito) autosembrados.
*   [x] **Frontend:** UI/UX funcional, refactorizada de mock a datos reales, enlazada a `posApi.ts`.
*   [x] **Frontend:** Selección de Método de Pago obligatoria, aplicación dinámica de Descuentos/Recargos y emisión de venta 100% transaccionada en la Nube.
*   [ ] **Frontend (Pendiente Sprint 4.1):** Operación Offline-First (Local Database Syncing para tickets transitorios) y Auth por PIN.

---

## Sprint 4.1: Estabilización Offline-First (Completado)
**Objetivo:** Garantizar la continuidad operativa del punto de venta ante inestabilidad de red y lograr persistencia "invisible".

*   [x] **Arquitectura de Persistencia Local:** Implementación de base de datos embebida (RxDB, Loro CRDT o IndexedDB pura) en el frontend.
*   [x] **Sync Manager:** Sincronizador en segundo plano (PowerSync o custom) para replicar el WAL PostgreSQL, respetando RLS en cliente.
*   [x] **Resolución de Conflictos:** Uso de CRDT (Conflict-free Replicated Data Types) para inventarios conmutativos.
*   [x] **Resiliencia de Red:** Interfaz React reactiva a caídas de conexión sin bloqueo, manteniendo la caja a la espera de retorno a línea.

---

## Sprint 4.2: Cliente 360 y CRM (Roadmap)
**Objetivo:** Capturar datos estratégicos para fidelización y personalización automática de la atención.

*   [x] **Perfil Unificado de Cliente:** Registro de DNI/CUIT (opcional) y preferencias de talle/color automatizadas según historial de compra.
*   [x] **Historial de Tendencias:** Seguimiento de hábitos de consumo y medios de pago. Soporte para ventas anónimas con asociación flexible al ticket.
*   [x] **Gestión de Saldos y Créditos:** Sistema de "dinero a favor" (o en contra) multi-sucursal para devoluciones y pagos parciales/totales. Capacidad de impactar saldos negativos y aplicar saldos a favor/en contra directo en el cierre del POS.
*   [x] **Módulo de Devoluciones y Cambios:** Sección dedicada para registrar prendas devueltas (restaurando stock) e intercambiarlas por otras (descontando stock), calculando diferencias a pagar, o dejando saldo pendiente en la cuenta del cliente de forma automática.
*   [x] **Dashboard de Fidelización:** Identificación de clientes recurrentes e integración para contacto directo vía WhatsApp.

---

## Sprint 4.5: Marketing y CRM Avanzado (Completado)
**Objetivo:** Otorgar a la empresa herramientas de segmentación dinámica y paneles analíticos reemplazando la vista de tarjetas básica.

*   [x] **Backend - Query Optimizado:** Refactorización de `ObtenerClientesQuery` inyectando subconsultas planas O(1) in-memory para calcular en tiempo real el `TotalCompras`, `TotalGastado` y `CategoriaPreferida`.
*   [x] **Frontend - Grilla Inteligente:** Reescritura absoluta de `ClientesPage.tsx` abandonando el modelo de Tarjetas e implementando una Tabla CRM con los saldos informados velozmente.
*   [x] **Frontend - Filtros de Embudo (Funnel):** Integración de filtros condicionales avanzados (Gasto Mínimo, Cantidad Mínima y Categoría de Ropa favorita).
*   [x] **Frontend - Modal 360 In-Line:** Refactorización de `PerfilClientePage.tsx` para funcionar re-utilizado dentro de una ventana Modal (Slide) sin forzar cambios de ruta.

---

## Sprint 4.3: Operación Móvil y Etiquetado (Completado)
**Fecha de Finalización:** 03/03/2026
**Objetivo:** Incrementar la eficiencia operativa en salón y depósito mediante hardware y movilidad.

*   [x] **Motor de Etiquetas Térmicas:** Generación de códigos 1D/QR para variantes de producto, compatible con impresoras Zebra y estándares industriales.
*   [x] **Escaneo Móvil de Consulta:** Integración de `useBarcodeScanner` en POS para agregado automático por SKU/EAN13.
*   [x] **Carga Masiva (Bulk Import) Pro:** Refactorización de la grilla de carga para procesamiento de altos volúmenes de mercadería via `CrearProductosBatchCommand`.
*   [x] **Diseño "Thumb Zone":** Ajuste ergonómico de la UI del POS para operación con una sola mano en dispositivos móviles (botón cobrar fijo).

---

## Sprint 4.4: Base Contable y Fiscal Pre-ARCA - [PRIORIDAD: ANTES DEL MVP]
**Objetivo:** Preparar la base de datos de Tenants, Ventas y generar Clientes antes de tocar los Web Services de AFIP, ajustando el despiece del IVA.

*   [ ] **Backend - Identidad Fiscal:** Añadir `CuitEmisor`, `CondicionIvaEmisor` y `PuntoDeVenta` a la entidad `Inquilino`. Endpoints para su configuración.
*   [x] **Backend - Clientes:** Entidad `Cliente` (CUIT/DNI, Nombre, CondicionIVA) y ABM básico.
*   [x] **Backend - Refactor de Venta:** Añadir `ClienteId` opcional.
*   [ ] **Backend - Desglose de IVA:** Desglosar matemáticamente `SubtotalNeto` e `IVA` en `VentaDetalle` desde el Command Handler.
*   [x] **Frontend:** Buscador de Clientes incorporado en el POS.
*   [ ] **Frontend - Fiscal:** Pantallas de Configuración Fiscal en `/ajustes`.

---

## Sprint 4.6: Atributos Dinámicos y Refinamiento UI (Completado)
**Fecha de Finalización:** 03/03/2026
**Objetivo:** Permitir personalización profunda por variante y pulir la experiencia de usuario en la matriz de carga.

*   [x] **Frontend:** Modal de "Detalles Extra" por variante en la matriz de productos.
*   [x] **Frontend:** Refactor de la Barra de Edición Masiva (Bulk Edit) modular y estética.
*   [x] **Frontend:** Bloqueo de ventas con stock 0 y alertas de inventario POS.
*   [x] **Frontend:** Refinamiento del origen de devoluciones.

---

## Sprint 4.7: Métodos de Pago en Ajustes de Saldo (Completado)
**Fecha de Finalización:** 03/03/2026
**Objetivo:** Garantizar la integridad del arqueo de caja permitiendo trazar el medio de pago en cargas manuales de dinero.

*   [x] **Backend:** Extensión de `MovimientoSaldoCliente` con `MetodoPagoId`.
*   [x] **Backend:** Actualización de comandos MediatR para persistencia de origen financiero.
*   [x] **Frontend:** Selector dinámico de métodos de pago en Modal de Saldo del Perfil 360.

---

## Sprint 4.13: Fundación PWA y App Shell (Completado)
**Objetivo:** Transformar el proyecto Vite en una Progressive Web App instalable con estrategias de caché agresivas.

*   [x] **Infraestructura Vite PWA:** Instalación y configuración de `vite-plugin-pwa`.
*   [x] **Manifiesto Dinámico:** Generación de `manifest.json` con metadatos, iconos HD, y `display: standalone`.
*   [x] **Instalación Consciente:** Captura del evento `beforeinstallprompt` para ofrecer la instalación solo tras interacción valiosa y omitir el banner por defecto.
*   [x] **Shortcuts API:** Accesos directos nativos del OS para saltar directamente a "Punto de Venta" o "Stock".
*   [x] **Rendimiento Workbox:** Configuración de Service Worker con caché `CacheFirst` para imágenes estáticas, `StaleWhileRevalidate` para precios, y Precache del App Shell.

---

## Sprint 4.14: Ergonomía Móvil y UX Adaptativa (Completado)
**Objetivo:** Adaptar 100% la app a los pulgares y a flujos táctiles (Touch Targets 44px, navegación inferior).

*   [x] **Navegación Móvil:** Layout con "Bottom Tab Bar" para celulares (POS, Buscar, Stock, Perfil) ocultando el Drawer clásico.
*   [x] **Teclado y Viewport:** Uso de `VisualViewport API` para re-acomodar el layout y botón de "Cobrar" al abrir el teclado virtual telefónico.
*   [x] **Estética Funcional:** Integración de tema oscuro (Dark Mode) y adecuación a `prefers-reduced-motion`.

---

## Sprint 4.15: Integración Híbrida de Hardware (Completado)
**Objetivo:** Aprovechar capacidades nativas del celular/tablet directamente desde la web.

*   [x] **File System Access:** Implementación de acceso nativo de archivos para descarga/guardado local de reportes en PDF y planillas Excel sin intermediar descargas complejas.
*   [x] **Impresión Bluetooth Directa:** (Opcional) Exploración del `Web Bluetooth API` para emitir comandos ESC/POS directo a impresoras enlazadas al celular, o usar interfaz HID serial mejorada.
*   [x] **Barcode Scanner Nativo:** Maximizar el uso de `BarcodeDetector API` del dispositivo (`ShapeDetection`) para leer códigos en cámara ultrarrápido sin servidor.
*   [x] **Social Commerce Push:** Receptor `Web Share Target` para "compartir" imágenes del teléfono directo hacia el módulo de Catálogo para armar un producto.

---


## Sprint 5: Middleware Fiscal "Nexo" (ARCA/AFIP)
**Objetivo:** Desarrollar una API independiente para la gestión del ciclo de vida fiscal (ARCA) con alta disponibilidad.

*   [ ] **Servicio de Autenticación:** Implementación de `TokenManager` para gestión de acceso WSAA con caché en Redis.
*   [ ] **Microservicio de Firma:** Lógica aislada para firma digital CMS utilizando certificados por inquilino (Azure Key Vault).
*   [ ] **Orquestador de Comprobantes:** Endpoints para WSFE v1 (Venta local), WSFEX (Exportación) y FCE (Factura de Crédito).
*   [ ] **Estrategia de Resiliencia:** Implementación de recuperación mediante `FECompUltimoAutorizado` para garantizar consistencia tras fallos de red.
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

---

## Sprint 8: Panel de Administración SaaS (SRE & Telemetría Global)
**Objetivo General:** Construir el "Backoffice Centralizado" para el equipo interno, permitiendo monitoreo de salud (Health), auditoría transaccional, métricas comerciales y gestión de inquilinos (Tenants) en un entorno de alta densidad.

### Sprint 8.1: Fundaciones del Backoffice y Bypass de Tenant
*   [ ] **Backend (Seguridad):** Implementación de rol estricto `SuperAdmin` en Identity/JWT.
*   [ ] **Backend (EF Core):** Mecanismo de "Bypass" temporal para deshabilitar el *Global Query Filter* (`IgnoreQueryFilters()`) solo en controladores del área de administración.
*   [ ] **Frontend (Arquitectura):** Creación de un sub-enrutador `/admin` (o proyecto Vite aislado) protegido, con UI enfocada en densidad de datos.
*   [ ] **Frontend (Gestión Básica):** ABM global de Tenants (Listar tiendas, Habilitar/Suspender servicio por falta de pago, Ver su plan activo).

### Sprint 8.2: Telemetría de Salud e Infraestructura (SaaS Health)
*   [ ] **Backend (Observabilidad):** Integración inicial de **OpenTelemetry** para medir latencia por Inquilino (detectar percentiles altos P95/P99 en carga de catálogo o POS).
*   [ ] **Base de Datos (PostgreSQL):** Queries de infraestructura apuntando a vistas estándar (`pg_stat_activity`, tamaño de esquemas/tablas) para alertar sobre tiendas que requieren *VACUUM* o consumen mucha memoria.
*   [ ] **Frontend (Dashboards):** Implementación de gráficos (Recharts/Nivo) mostrando la salud del hardware y cuellos de botella por tienda.
*   [ ] **Sincronización PWA V2:** Endpoints para que el Backoffice vea en tiempo real la "Longitud de la cola pendiente" (Sync Queue) de las cajas offline de cada tienda.

### Sprint 8.3: Centro de Auditoría y Debugger de Transacciones
*   [ ] **Backend (Buscador JSONB):** Aprovechar los índices GIN de PostgreSQL sobre la tabla `LogsAuditoria` para crear un buscador global ultrarrápido (Ej: *"Buscar quién y cuándo le cambió el precio a la remera roja en la sucursal X"*).
*   [ ] **Backend/Frontend (Transaction Debugger):** Interfaz para especialistas de soporte que toma un UUID de Venta e imprime todo su ciclo de vida cronológico, especialmente útil para fallos de sincronía offline o rechazos de AFIP/ARCA.
*   [ ] **Alertas de Fraude:** Reglas Heurísticas automáticas (Ej: Ráfagas de devoluciones en menos de 10 minutos, o modificaciones de stock manuales en horarios de madrugada).

### Sprint 8.4: Analítica de Producto Comercial (SaaS Insights)
*   [ ] **Backend (Métricas MRR):** Cálculo de usuarios únicos diarios por tienda (DAU) y Churn Rate mensual para el equipo de Ventas.
*   [ ] **Algoritmo de Inventario Fantasma:** Detección probabilística matemática de discrepancias "Sistemas vs Real" basada en que un producto rotaba siempre y de repente dejó de venderse.
*   [ ] **Frontend:** Tablero comercial *Customer Success* dedicado a mejorar la retención (TTFV - Time to First Value).

