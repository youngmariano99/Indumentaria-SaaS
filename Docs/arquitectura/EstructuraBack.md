1. Backend (.NET 8 - Clean Architecture) 🖥️
La estructura debe asegurar la modularidad, facilidad para escalar a múltiples inquilinos (Multi-tenancy) y separación estricta de responsabilidades (por ejemplo, aislamento de integraciones con ARCA).

backend/
├── puntoVentaInd.sln                   # Solución principal
├── src/
│   ├── Core/                           # (Domain Layer) Sin dependencias externas
│   │   ├── Entities/                   # Entidades de negocio (Tenant, Product, Invoice, Wallet, etc.)
│   │   ├── Enums/                      # Módulos de suscripción, Estados de Factura, Roles, etc.
│   │   ├── Exceptions/                 # Excepciones de dominio personalizadas
│   │   └── Interfaces/                 # Interfaces para Repositorios y Servicios Externos (ARCA, Email)
│   │
│   ├── Application/                    # (Application Layer) Casos de Uso
│   │   ├── DTOs/                       # Objetos de Transferencia de Datos
│   │   ├── Features/                   # Lógica agrupada por funcionalidad (CQRS con MediatR)
│   │   │   ├── Catalog/                # Comandos y Queries para Productos y Matrices
│   │   │   ├── Fiscal/                 # Orquestación de WSFE, Notas de Crédito, etc.
│   │   │   ├── POS/                    # Lógica de venta offline-first y Sync
│   │   │   └── Tenants/                # Gestión de Suscripciones y Feature Flags
│   │   └── Validations/                # Validaciones complejas (FluentValidation)
│   │
│   ├── Infrastructure/                 # (Infrastructure Layer) Implementaciones técnicas
│   │   ├── Persistence/                # Configuración de base de datos (PostgreSQL)
│   │   │   ├── Contexts/               # ApplicationDbContext con Global Query Filters para TenantId
│   │   │   ├── Interceptors/           # Interceptores para Auditoría (AuditLog en JSONB)
│   │   │   ├── Migrations/             # Migraciones de EF Core
│   │   │   └── Repositories/           # Implementación concreta de Repositorios (con RLS habilitado)
│   │   ├── ExternalServices/           # Integraciones
│   │   │   ├── ARCA/                   # SOAP, firma digital, Source Generators para XML
│   │   │   └── Redis/                  # Caché para Tokens de Acceso (WSAA)
│   │   └── Security/                   # Manejo de Certificados y HSM/Azure Key Vault (Soberanía Criptográfica)
│   │
│   └── API/                            # (Presentation Layer) Controladores REST
│       ├── Controllers/                # Endpoints agrupados por dominio
│       ├── Middleware/                 # TenantResolverMiddleware, GlobalExceptionHandling
│       ├── Program.cs                  # Configuración de inyección de dependencias (DI)
│       └── appsettings.json
│
└── tests/
    ├── Core.UnitTests/
    ├── Application.UnitTests/
    └── API.IntegrationTests/
