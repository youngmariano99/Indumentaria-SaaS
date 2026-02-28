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

## Sprint 3.2 — Parte 3: Escalas de Talles Internacionales (Roadmap)
**Fechas Estimadas:** Post Sprint 4 (POS)
**Objetivo:** Soporte para productos importados con escalas de talles de otros países.

*   [ ] **Ajustes — País de operación por defecto:** El tenant elige su país base (Argentina, Europa, USA, etc.). Los talles pre-cargados se adaptan a esa escala.
*   [ ] **Formulario de carga — Escala de talles por producto:** Desplegable por producto para elegir la escala de talles (AR, EU, US, UK, BR). Útil para ropa importada que viene con talles del país de origen.
*   [ ] **Tabla de conversión:** Mapeo base entre escalas (ej: EU 38 = AR 38 = US 7.5) como referencia visual para el operador. No convierte automáticamente — muestra la equivalencia.
*   [ ] Referencia: `Docs/indicacionesIA/Talles.md`.

---

## Sprint 3.4: ABM de Catálogo Completo (Edición y Baja Lógica) - [PRIORIDAD: ANTES DEL MVP]
**Objetivo:** Permitir la modificación de precios y la ocultación de productos (baja lógica) sin destruir el historial contable de ventas pasadas. Requisito estricto antes de lanzar al público.

*   [ ] **Backend:** Interfaz `ISoftDelete` en `Producto` y `VarianteProducto` con Global Query Filter asociado.
*   [ ] **Backend:** Comandos y Endpoints `PUT /api/productos/{id}` y `DELETE /api/productos/{id}`.
*   [ ] **Frontend:** Adición de botones Editar/Eliminar en las cards del Catálogo.
*   [ ] **Frontend:** Re-utilización de `NuevoProductoPage` para inicializarse con datos existentes (Modo Edición).

---

## Sprint 3.5: Roadmap Futuro — Catálogo Avanzado (Diferido post-MVP)
> Estas funcionalidades requieren migraciones complejas y rediseño profundo. Se implementan luego del POS y solo si hay demanda real de clientes.

*   [ ] **Categorías Jerárquicas con NCM:** Tabla de categorías con código NCM del MERCOSUR para automatizar tributación y comercio exterior.
*   [ ] **Atributos Dinámicos EAV:** Tablas `DefinicionAtributos` y `MapeoAtributosCategoria` para campos propios por categoría (Copa/Contorno para Ropa Interior, Tipo de Suela para Calzado, etc.).
*   [ ] **Activación de Atributos por Tenant:** Un local de ropa de oficina ve solo categorías formales; un local deportivo ve Deporte + Athleisure.
*   [ ] **Metadata de Logística por SKU:** Peso, dimensiones, GTIN/EAN-13, País de Origen, Composición de fibra para integración con e-commerce y aduanas.
*   [ ] **Packs y Bundles:** Soporte para "Pack SKU Único", "Virtual Bundle" y "Pre-packs Mayoristas" (curvas de talles).
*   [ ] **Edición y Eliminación de Productos:** Endpoint `PUT /api/productos/{id}` y `DELETE` con baja lógica para preservar historial de ventas.

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

## Sprint 4.1: Estabilización Offline-First (Roadmap)
**Objetivo:** Garantizar la continuidad operativa del punto de venta ante inestabilidad de red.

*   [ ] **Arquitectura de Persistencia Local:** Implementación de base de datos embebida (SQLite/IndexedDB) para registro inmediato de ventas.
*   [ ] **Sync Manager:** Motor de sincronización en segundo plano para subida diferida de comprobantes y resolución de conflictos de stock.
*   [ ] **Resiliencia de Red (Mesh):** Configuración de redundancia para comunicación entre dispositivos vía Bluetooth o Wi-Fi Direct.
*   [ ] **UX No Bloqueante:** Optimización de la interfaz React para operar sin latencia durante micro-cortes de conexión.

---

## Sprint 4.2: Cliente 360 y CRM (Roadmap)
**Objetivo:** Capturar datos estratégicos para fidelización y personalización automática de la atención.

*   [ ] **Perfil Unificado de Cliente:** Registro de DNI/CUIT (opcional) y preferencias de talle/color automatizadas según historial de compra.
*   [ ] **Historial de Tendencias:** Seguimiento de hábitos de consumo y medios de pago. Soporte para ventas anónimas con asociación flexible al ticket.
*   [ ] **Gestión de Saldos y Créditos:** Sistema de "dinero a favor" multi-sucursal para devoluciones y pagos parciales/totales.
*   [ ] **Dashboard de Fidelización:** Identificación de clientes recurrentes e integración para contacto directo vía WhatsApp.

---

## Sprint 4.3: Operación Móvil y Etiquetado (Roadmap)
**Objetivo:** Incrementar la eficiencia operativa en salón y depósito mediante hardware y movilidad.

*   [ ] **Motor de Etiquetas Térmicas:** Generación de códigos 1D/QR para variantes de producto, compatible con impresoras Zebra y estándares industriales.
*   [ ] **Escaneo Móvil de Consulta:** Aplicación para consulta instantánea de stock en depósito y sucursales remotas mediante cámara del celular.
*   [ ] **Carga Masiva (Bulk Import) Pro:** Refactorización de la grilla de carga para procesamiento de altos volúmenes de mercadería.
*   [ ] **Diseño "Thumb Zone":** Ajuste ergonómico de la UI del POS para operación con una sola mano en dispositivos móviles.

---

## Sprint 4.4: Base Contable y Fiscal Pre-ARCA - [PRIORIDAD: ANTES DEL MVP]
**Objetivo:** Preparar la base de datos de Tenants, Ventas y generar Clientes antes de tocar los Web Services de AFIP, ajustando el despiece del IVA.

*   [ ] **Backend - Identidad Fiscal:** Añadir `CuitEmisor`, `CondicionIvaEmisor` y `PuntoDeVenta` a la entidad `Inquilino`. Endpoints para su configuración.
*   [ ] **Backend - Clientes:** Entidad `Cliente` (CUIT/DNI, Nombre, CondicionIVA) y ABM básico.
*   [ ] **Backend - Refactor de Venta:** Añadir `ClienteId` opcional. Desglosar matemáticamente `SubtotalNeto` e `IVA` en `VentaDetalle` desde el Command Handler.
*   [ ] **Frontend:** Pantallas de Configuración Fiscal y Buscador de Clientes en el POS.

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
