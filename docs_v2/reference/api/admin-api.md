---
title: "Referencia de API: Panel de Administración (SuperAdmin)"
description: Herramientas globales de gestión de inquilinos, auditoría y monitoreo del SaaS.
status: internal
globs: ["backend/src/API/Controllers/Admin*.cs", "Application/Common/Interfaces/IApplicationDbContext.cs"]
---

# Panel de Control Global (SuperAdmin)

Este módulo es una interfaz privilegiada que permite al equipo técnico de **Indumentaria-SaaS** (AppyStudios) gestionar el ecosistema completo de inquilinos.

## 📡 Endpoints (Solo SuperAdmin)

### 1. Gestión de Inquilinos (Tenants)
Lista todas las tiendas registradas en el sistema, independientemente de su rubro o plan.

- **URL:** `GET /api/admin/tenants`
- **Auth:** Requerido (Solo `SuperAdmin`)
- **Respuesta:** Array de inquilinos con metadatos básicos (Plan, Estado, Subdominio).

### 2. Auditoría Global e Insights
Muestra logs de actividad del sistema completo, alertas de salud y métricas de uso agregadas.

- **URL:** `GET /api/adminaudit`: Logs técnicos detallados.
- **URL:** `GET /api/adminhealth`: Estado de servicios (DB, Redis, ARCA connectivity).
- **URL:** `GET /api/admininsights`: Métricas comerciales agregadas (Total facturado en el SaaS, top rubros).

---

## 🔒 Aislamiento y Bypass (Arquitectura)
Este es el **único** módulo que utiliza el modo `EnterBypassMode()` en el `ApplicationDbContext`.

> [!WARNING]
> **Privilegios Elevados**: Al ejecutar `EnterBypassMode()`, el sistema deshabilita los filtros globales `TenantId`. Esto permite que el SuperAdmin vea datos consolidados de todos los clientes. Solo debe usarse en controladores específicos de administración técnica.
