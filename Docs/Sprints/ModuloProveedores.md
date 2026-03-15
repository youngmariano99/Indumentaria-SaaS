# Plan de Sprints - Módulo de Proveedores (FINALIZADO)

Este documento detalla los pasos para la implementación del módulo de Proveedores y Cuentas por Pagar, diseñado para ser multi-rubro (Indumentaria y Ferretería) y preparado para futura integración con Azure AI Document Intelligence.

## Sprint 1: Cimientos del Backend (Entidades y Base de Datos) - COMPLETO
- [x] Creación de entidad `Proveedor` (Vendor).
- [x] Creación de entidad `FacturaProveedor` (VendorInvoice).
- [x] Creación de entidad `PagoProveedor` (Payment).
- [x] Creación de entidad `DistribucionPagoFactura` (InvoicePaymentAllocation).
- [x] Creación de entidad `ChequeTercero` (ThirdPartyCheck).
- [x] Creación de entidad `ProveedorProducto` (VendorItem).
- [x] Configuración de Fluent API en `ApplicationDbContext`.
- [x] Registro de DbSets en `IApplicationDbContext`.

## Sprint 2: Lógica de Compras y Tuberías de IA - COMPLETO
- [x] Definición de interfaz `IReconocimientoFacturaService` y su implementación "Mock/Dummy".
- [x] Implementación del Importador Masivo de Listas de Precios usando `NpgsqlBinaryImporter`.
- [x] Background Service para Generación de Órdenes de Compra Automáticas basadas en Punto de Reorden (ROP).

## Sprint 3: Interfaz de Usuario (Frontend - Gestión Básica) - COMPLETO
- [x] Listado y CRUD de Proveedores (`ProveedoresPage.tsx`).
- [x] Implementación de la **Data Grid Teclado-Céntrica** para carga rápida de facturas (`CargaFacturaPage.tsx`).
- [x] Integración del estado visual de "Revisión de IA" (celdas amarillas para baja confianza).
- [x] Placeholder de Dropzone para "Subir Foto de Factura".

## Sprint 4: Dashboard Financiero y Mutación por Rubro - COMPLETO
- [x] Tablero Kanban interactivo para Cuentas por Pagar (`KanbanAPPage.tsx`).
- [x] Lógica de Mutación de UI (`RubroMutationPanel.tsx`):
    - **Indumentaria**: Matriz Talles vs. Colores.
    - **Ferretería**: Panel de actualización masiva y productos sustitutos.

## Sprint 5: Pulido, Pruebas y Documentación - COMPLETO
- [x] Integración en Sidebar y Enrutador.
- [x] Documentación técnica en `Docs/desarrollo/2026-03-12_1700_Modulo_Proveedores.md`.
