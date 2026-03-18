# Arquitectura de Sistema: Modelo C4

Este documento visualiza la jerarquía técnica de Indumentaria-SaaS mediante el estándar C4 y Mermaid.js.

---

## 🔝 Nivel 1: Diagrama de Contexto
Muestra el sistema como una caja negra y sus interacciones con el ecosistema externo.

```mermaid
graph TD
    classDef internal fill:#1168bd,color:#fff,stroke:#0b4884;
    classDef external fill:#666,color:#fff,stroke:#444;
    classDef users fill:#08427b,color:#fff,stroke:#052e56;

    Owner((Propietario)):::users
    Staff((Vendedor/Cajero)):::users
    
    System[<b>Indumentaria-SaaS ERP</b><br/>Gestión Multi-Tenant]:::internal

    AFIP[<b>ARCA / AFIP</b><br/>Servicios Fiscales]:::external
    Payments[<b>Pasarelas de Pago</b><br/>Mercado Pago, etc.]:::external
    Printers[<b>Hardware Local</b><br/>Impresoras Térmicas]:::external

    Owner -->|Configura negocio y ve reportes| System
    Staff -->|Procesa ventas y stock| System
    System -->|Emite Factura Electrónica| AFIP
    System -->|Solicita cobro| Payments
    System -->|Envía comandos ESC/POS| Printers
```

---

## 🧱 Nivel 2: Diagrama de Contenedores
Desglose del sistema en sus aplicaciones y almacenes de datos principales.

```mermaid
graph TB
    classDef container fill:#2b78e4,color:#fff,stroke:#1b4a8d;
    classDef db fill:#339933,color:#fff,stroke:#267326;

    subgraph "Cliente (Navegador/PWA)"
        SPA[<b>Frontend SPA</b><br/>React + Vite<br/><br/>UI Mutante, Lógica Offline,<br/>Zustand Store]:::container
    end

    subgraph "Servidor (Backend)"
        API[<b>Web API</b><br/>.NET 8/9 Core<br/><br/>Clean Architecture, CQRS,<br/>Vertical Strategies]:::container
        Cache[(<b>Redis</b><br/>Caché de Tokens y Toggles)]:::db
    end

    subgraph "Persistencia"
        DB[(<b>PostgreSQL</b><br/>DB Relacional<br/><br/>Aislamiento RLS,<br/>Modelado JSONB)]:::db
    end

    SPA -->|HTTPS / JWT / Base64 Headers| API
    API -->|Npgsql / Entity Framework| DB
    API -->|StackExchange.Redis| Cache
    
    SPA -->|Local IndexDB| SPA
```

---

## 🧩 Patrones Arquitectónicos Clave

### A. Multi-tenant Férreo (Aislamiento RLS)
Para garantizar la privacidad, PostgreSQL aplica políticas de **Row-Level Security**. El backend inyecta el `TenantId` en la sesión de base de datos mediante un interceptor de conexión, asegurando que las consultas nunca "vean" datos de otros inquilinos.

### B. UI Mutante (Metadata-Driven)
El sistema no usa `if (rubro == 'X')`. En su lugar, el backend envía un **Manifiesto de Rubro** (Base64 Headers) que el frontend consume para:
1. Reemplazar terminología (ej: "Prenda" vs "Artículo").
2. Resolver componentes específicos mediante un `ComponentRegistry`.

### C. Clean Architecture (CQRS)
El backend desacopla la lógica de negocio del transporte:
- **Core**: Entidades e interfaces.
- **Application**: Comandos y Queries (MediatR).
- **Infrastructure**: Implementación de persistencia y servicios externos.
- **API**: Controladores delgados.
