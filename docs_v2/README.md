# Indumentaria-SaaS: Plataforma ERP de Alta Escalabilidad 🇦🇷

> **Standard de Transferibilidad Total v2.0**
> Basado en el framework [Diátaxis](https://diataxis.fr/) y metodología *Docs-as-Code*.

## 🎯 Propósito del Sistema

Indumentaria-SaaS es un ecosistema ERP diseñado para resolver la fragmentación operativa del retail y la industria textil en Argentina. La plataforma permite a los negocios escalar desde un único local hasta cadenas masivas mediante una infraestructura **Multi-Inquilino (Multi-tenant)**, **Multi-Sucursal** y **Multi-Rubro**.

El sistema no solo gestiona el stock y las ventas, sino que actúa como una "Fortaleza de Flujo de Trabajo" integrando cumplimiento fiscal crítico (ARCA/AFIP), omnicanalidad y herramientas de fidelización avanzada.

---

## 💼 Modelo de Negocio (Business Core)

La plataforma opera bajo un modelo de **Núcleo Base + Módulos Potenciadores**:

1.  **Módulo Base ("Derecho a jugar")**: 
    - Gestión de matriz de stock (Talle/Color).
    - Punto de venta (POS) con capacidades *Offline-first*.
    - Gestión de staff con alta rotación (Acceso por PIN).
    - Control de inventario perpetuo.

2.  **Módulos Potenciadores (ROI Upselling)**:
    - **Fiscalidad**: Integración total con ARCA/AFIP para Factura Electrónica (WSFE, FCE, CAEA).
    - **Omnicanalidad**: Visibilidad de stock en tiempo real entre sucursales y ecommerce.
    - **Customer Wallet**: Sistema de devoluciones con crédito digital (evitando vales de papel).
    - **IA Financiera**: Predicción de demanda y salud financiera del inventario.

---

## 🏗️ Stack Tecnológico (High-Level)

- **Backend**: .NET 8/9 LTS | Clean Architecture | MediatR (CQRS).
- **Frontend**: React 18+ | Vite | Zustand | Vanilla CSS Modules.
- **Base de Datos**: PostgreSQL 16+ | Row-Level Security (RLS) | JSONB.
- **Estrategia Multi-Rubro**: Patrón Estrategia Dinámico que permite al sistema mutar entre industrias (Indumentaria, Ferretería, etc.) sin cambios en el código base.

---

## 📂 Directorio de Documentación

Para una comprensión profunda, navega por las categorías de **Diátaxis**:

- 📂 [**`explanation/`**](explanation/business-model.md): Conceptos profundos y lógica de negocio.
- 📂 [**`architecture/`**](architecture/architecture.md): Diagramas C4 y diseño técnico del sistema.
- 📂 [**`how-to/`**](how-to/): Guías prácticas para tareas específicas.
- 📂 [**`reference/`**](reference/): Especificaciones de API, esquemas de DB y diccionarios.

---
© 2026 Indumentaria-SaaS Team. Diseñado para ser escalado, construido para ser transferido.
