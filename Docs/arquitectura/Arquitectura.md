# Arquitectura General: SaaS Multi-Rubro (Vertical SaaS)

Este documento describe la arquitectura técnica del sistema, diseñada para ser altamente escalable, multi-inquilino y capaz de adaptarse a diversos rubros de negocio (Verticales) de forma dinámica.

## 1. Stack Tecnológico Completo
- **Backend:** .NET 8 (LTS). Estructurado bajo Clean Architecture y CQRS con MediatR.
- **Frontend:** React + TypeScript + Vite. Estética premium con Tailwind CSS (opcional) y Vanilla CSS.
- **Base de Datos:** PostgreSQL con soporte para JSONB (Metadatos dinámicos) y Row Level Security (RLS) para aislamiento de tenants.
- **Infraestructura:** Docker para contenedores y Redis para caché de sesiones y tokens fiscales.

## 2. Arquitectura de Verticales (Multi-Rubro)
A diferencia de un SaaS monolítico, el sistema utiliza un modelo de **Núcleo Compartido con Extensiones Verticales**, lo que permite que una misma base de código sirva a rubros tan distintos como Indumentaria y Ferretería sin "código espagueti".

### 2.1 Backend: Patrón Estrategia Dinámico
Se eliminan los condicionales estáticos (`if rubro == X`). En su lugar, el sistema implementa:
- **IVerticalRules:** Interfaz core que define el contrato de comportamiento para cada rubro (terminología, validaciones, lógica de stock).
- **VerticalRulesFactory:** Factoría que inyecta la implementación correcta (ej: `FerreteriaRules`) en tiempo de ejecución basada en el contexto del inquilino activo.
- **Estrategias Dinámicas:** Los validadores de productos y creadores de variantes se resuelven mediante el Factory, permitiendo que el núcleo del sistema sea agnóstico al rubro.

### 2.2 Frontend: Registro Dinámico de Componentes
El frontend utiliza una arquitectura de **UI Mutante**:
- **ComponentRegistry:** Un registro central que mapea "Keys" de componentes a implementaciones específicas por rubro.
- **Hook useRubro:** Provee la función `resolveComponent(key)`, que permite a las páginas base cargar sus piezas visuales específicas (ej: Matrix de Talles para indumentaria vs Lista de Unidades para ferretería) de forma transparente.
- **Lazy Loading:** Los componentes específicos se cargan bajo demanda, optimizando el rendimiento inicial.

## 3. Estrategias de Multi-tenancy
- **Aislamiento de Datos:** Se utiliza un `TenantId` global inyectado en cada consulta de base de datos mediante filtros globales de EF Core.
- **Configuración por Rubro:** Cada inquilino está asociado a un `Rubro` que define su "Personalidad Técnica" mediante un `Slug` (ej: "ferreteria").
- **Terminología Dinámica:** La capa de localización adapta el vocabulario técnico (ej: "Prenda" -> "Artículo") mediante un diccionario JSON inyectado desde la base de datos para cada rubro.

## 4. Módulos Core y su Adaptabilidad
- **Catálogo:** Estructura base común, pero con grillas de carga de variantes que mutan según el rubro.
- **Ventas (POS):** Flujo de cobro unificado con soporte para métodos de pago dinámicos.
- **Dashboard e Inteligencia de Negocio:** Widgets especializados que se activan según la vertical (ej: Reposición de Stock Crítico para Ferretería vs Análisis de Temporada para Indumentaria).
- **Cuentas Corrientes:** Gestión de deuda de clientes con desgloses financieros adaptados al flujo de cada negocio.

## 5. Mobile-First y Offline-First
- **UX Adaptativa:** Diseño optimizado para la "Zona del Pulgar" y uso intensivo en tablets de salón.
- **Resiliencia:** Capacidad futura de sincronización offline para operaciones críticas en puntos de venta con conectividad inestable.

## 6. Seguridad
- **JWT con Contexto:** El token de autenticación incluye no solo el ID de usuario, sino también el `TenantId` y el `RubroSlug`.
- **Auditoría:** Registro de acciones sensibles mediante interceptores de EF Core que guardan quién, cuándo y qué cambió en cada entidad.
