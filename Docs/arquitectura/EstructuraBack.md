# Estructura del Backend (.NET 8 - Clean Architecture) 🖥️

La estructura asegura la modularidad mediante la separación de la lógica core de las extensiones específicas de rubro (Verticales).

```text
backend/
├── src/
│   ├── Core/                           # (Domain Layer)
│   │   ├── Entities/                   # Entidades (Producto, Inquilino, Rubro, etc.)
│   │   ├── Enums/                      # Estados, Modulos, Categorías fijas
│   │   └── Interfaces/                 # IVerticalRules, ITenantResolver, ITenantResolver
│   │
│   ├── Application/                    # (Application Layer - Casos de Uso)
│   │   ├── DTOs/                       # Objetos de datos
│   │   ├── Features/                   # CQRS (Catalog, Ventas, Reports, Arqueo)
│   │   └── Verticals/                  # Servicios de aplicación específicos por rubro
│   │
│   ├── Infrastructure/                 # (Infrastructure Layer - Soporte Técnico)
│   │   ├── Persistence/                # PostgreSQL, ApplicationDbContext, RLS
│   │   ├── Verticals/                  # Reglas de negocio específicas (IndumentariaRules, FerreteriaRules)
│   │   ├── Services/                   # Factory y Resolvers (VerticalRulesFactory, FeatureResolver)
│   │   ├── Auth/                       # Implementación de JWT y Password Hasher
│   │   └── ExternalServices/           # Integraciones externas (ARCA, Redis)
│   │
│   └── API/                            # (Presentation Layer - Endpoints)
│       ├── Controllers/                # ReportesController, VentasController, etc.
│       ├── Middleware/                 # TenantResolverMiddleware (Inyecta el RubroSlug)
│       └── Program.cs                  # Orquestador de dependencias dinámicas
```

## Patrones Aplicados
- **Strategy Pattern:** Utilizado para inyectar reglas verticales dinámicamente.
- **Dependency Injection:** Configurada para resolver implementaciones basadas en el contexto del usuario (Inquilino -> Rubro -> Reglas).
- **CQRS:** Separación estricta entre lecturas (Queries) y escrituras (Commands).
