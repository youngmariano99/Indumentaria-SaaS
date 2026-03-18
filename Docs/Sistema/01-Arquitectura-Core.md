# Arquitectura Core del Sistema (Backend)

Este documento describe la infraestructura fundamental que sostiene a Indumentaria-SaaS, enfocándose en la seguridad, escalabilidad y el soporte multi-rubro.

---

## 🏗️ 1. Clean Architecture y CQRS
El backend está estructurado siguiendo los principios de **Clean Architecture**, dividiendo la lógica en capas para garantizar el desacoplamiento:

- **Core**: Contiene las entidades de dominio (`BaseEntity`), interfaces base y excepciones de negocio. No tiene dependencias externas.
- **Application**: Es el motor de la lógica. Implementa el patrón **CQRS** mediante **MediatR**. Cada acción del usuario es un `Command` (escritura) o una `Query` (lectura).
- **Infrastructure**: Implementa las interfaces del Core (Persistencia, Auth, Feature Toggles). Aquí reside EF Core, la lógica de **Testing de Integración** y las integraciones con servicios externos (ej: Impresión, Fiscal).
- **API**: El punto de entrada HTTP. Contiene los controladores que delegan el trabajo a MediatR.

### Flujo de una Petición
1. El `Controller` recibe el HTTP Request.
2. Se envía un `Command`/`Query` al bus de MediatR.
3. Un `ValidationBehavior` intercepta la petición y valida reglas con `FluentValidation`.
4. El `Handler` correspondiente ejecuta la lógica de negocio usando `IApplicationDbContext`.

---

## 🔐 2. Seguridad Multi-Tenant (RLS)
Para garantizar el aislamiento total de datos entre diferentes negocios (inquilinos), utilizamos una estrategia de **Row-Level Security (RLS)** asistida por EF Core:

### Implementación Técnica
1. **Identificación**: El `TenantResolverMiddleware` extrae el `TenantId` del subdominio o del JWT.
2. **Sesión de BD**: El `TenantSessionInterceptor` (un `DbConnectionInterceptor`) ejecuta un comando SQL al abrir cada conexión:
   ```sql
   SET LOCAL app.current_tenant = '{tenantId}';
   ```
3. **Filtros Globales**: En el `ApplicationDbContext`, todas las entidades que implementan `IMustHaveTenant` tienen un filtro automático:
   ```csharp
   builder.Entity<T>().HasQueryFilter(e => e.TenantId == CurrentTenantId);
   ```
   *Nota: Se puede usar `EnterBypassMode()` en el DbContext para consultas administrativas que requieran saltar este filtro.*

---

## 🔄 3. Motor Multi-Rubro
El sistema es capaz de cambiar su terminología y comportamiento según el rubro del inquilino (ej: Indumentaria vs Ferretería) mediante metadatos dinámicos.

### Diccionario Dinámico
El `DiccionarioRubroMiddleware` intercepta cada respuesta y adjunta encabezados HTTP:
- `X-Rubro-Id`: ID del rubro actual.
- `X-Rubro-Slug`: Identificador amigable (ej: "ferreteria").
- `X-Rubro-Manifest`: Un JSON codificado en **Base64** que contiene el mapeo de términos (ej: `{"Producto": "Repuesto", "Variante": "Talle"}`).
- **¿Por qué Base64?**: Para evitar que caracteres especiales o acentos en el JSON rompan el protocolo HTTP en los headers.

---

## 🚩 4. Feature Toggles y Permisos
La visibilidad de módulos y funciones se controla mediante el `FeatureResolver`, que maneja una jerarquía de resolución:

1. **Rubro**: Funcionalidades base de la industria.
2. **Inquilino**: Funcionalidades contratadas por el negocio (Planes).
3. **Sucursal**: Restricciones por ubicación física.
4. **Usuario**: Permisos específicos asignados por el Dueño.

Este sistema está optimizado con un caché de memoria de Nivel 1 para evitar consultas redundantes a la base de datos en cada petición.

## 🏢 5. Normas de Nomenclatura ("Con Cancha")
Para que el código sea legible y represente la realidad del negocio, seguimos estas reglas:
- **Español para el Negocio**: Entidades, tablas, comandos y métodos de lógica deben nombrarse en español (ej: `ProcesarNotaDeCredito`, `ObtenerStockPorTalle`).
- **Inglés Técnico**: Solo se mantiene inglés para términos estándar (`Middleware`, `Controller`, `TenantId`, `JWT`, `Repository`).
- **Diferenciación ARCA (AFIP)**: Términos legales específicos se mantienen tal cual la normativa (`CAE`, `CondicionIva`, `WebserviceAFIP`).

---

## 🧪 6. Estrategia de Testing (Malla de Seguridad)
No "probamos suerte"; usamos **Integration Testing** automatizado:
- **Navegador Fantasma (`WebApplicationFactory`)**: Levantamos la API completa en memoria para cada test.
- **Base de Datos Efímera (`InMemoryDatabase`)**: Se crea una base de datos limpia en RAM para cada conjunto de pruebas, evitando basura en el PostgreSQL de desarrollo.
- **FluentAssertions**: Los tests se escriben para ser legibles: `respuesta.StatusCode.Should().Be(HttpStatusCode.OK)`.

---

## 🛠️ Stack Tecnológico Principal
- **Framework**: .NET 8/9 (Core).
- **Base de Datos**: PostgreSQL 16+.
- **ORM**: Entity Framework Core.
- **Bus de Mensajes**: MediatR.
- **Validación**: FluentValidation.
- **Testing**: xUnit + FluentAssertions.
- **Auth**: JWT con BCrypt para Hasheo.
