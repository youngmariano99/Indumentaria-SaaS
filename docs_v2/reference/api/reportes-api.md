---
title: "Referencia de API: Reportes e Inteligencia"
description: Listado de indicadores de salud financiera, monitoreo de stock y dashboards.
status: stable
globs: ["backend/src/Application/Features/Reports/**/*", "frontend/src/features/dashboard/api/*"]
---

# Dashboards y Reportes de Salud Financiera

Este módulo consolida la información transaccional para proveer inteligencia de negocio al dueño de la tienda.

## 📡 Endpoints

### 1. Pulso Diario (Real-time)
Retorna las métricas críticas del día en curso: Total ventas, cantidad de tickets y apertura de caja actual.

- **URL:** `GET /api/reportes/pulso-diario`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `PulsoDiarioDto`

### 2. Monitoreo de Stock Crítico
Lista todas las variantes de producto que han caído por debajo del umbral de stock mínimo (Alerta de reposición).

- **URL:** `GET /api/reportes/bajo-stock`
- **Auth:** Requerido
- **Respuesta:** `BajoStockDto[]`

### 3. Valorización de Inventario
Calcula el valor total de la mercadería en stock a precio de costo y a precio de venta (Muestra el Capital Inmovilizado).

- **URL:** `GET /api/reportes/valorizacion-inventario`
- **Auth:** Requerido
- **Respuesta:** `ValorizacionInventarioDto[]`

### 4. Aging Report (Antigüedad de Stock)
Analiza la rotación de stock indicando cuántos días lleva en estantería cada modelo (Detecta "clavo" o mercadería sin movimiento).

- **URL:** `GET /api/reportes/aging-report`
- **Auth:** Requerido
- **Respuesta:** `AgingReportDto[]`

### 5. Dashboard Corporativo
Para inquilinos Multi-Sucursal, provee una vista consolidada de todas las sedes en un solo panel.

- **URL:** `GET /api/reportes/corporativo`
- **Auth:** Requerido (Solo `Owner`)
- **Respuesta:** `ReporteCorporativoDto`

---

## 🏛️ Lógica de Monitoreo
Los reportes se procesan en tiempo real contra los últimos datos transaccionales. Para optimizar el rendimiento, se recomienda el uso del flag `AsNoTracking()` en las consultas de EF Core para evitar la carga innecesaria en el Change Tracker.
