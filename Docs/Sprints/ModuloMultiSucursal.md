# Plan de Sprints: Módulo Multi-Sucursal

**Objetivo:** Permitir que los negocios escalen físicamente, gestionando múltiples puntos de venta y depósitos desde una única cuenta maestra, con inventarios y reportes independientes.

---

## 🟢 Etapa 1: Preparación del Core (COMPLETADO)
*Foco: Preparar la base de datos para entender la ubicación física.*

- [x] **Modelo de Sucursal:** Entidad `Sucursal` vinculada al `TenantId`.
- [x] **Relación con Inventario:** Estructura lista para soportar `Stock` diferenciado por sucursal.
- [x] **Contexto en Middleware:** Sistema preparado para recibir el header `X-Sucursal-Id` y filtrar datos automáticamente.
- [x] **Módulo de Suscripción:** Definición de la característica `Multisucursal` en el motor de facturación/features.

---

## 🟡 Etapa 2: Gestión de Ubicaciones (PRÓXIMAMENTE)
*Foco: Pantallas de administración de locales.*

- [ ] **API de Sucursales:**
    - [ ] CRUD de Sucursales (Nombre, Dirección, Teléfono, esDepósitoCentral).
    - [ ] Lógica de validación: **"Primera sucursal de prueba gratis"**. Control de creación según límites comerciales.
- [ ] **Pantalla de Ajustes -> Sucursales:**
    - [ ] Listado de locales activos.
    - [ ] Mapa o pins de ubicación (opcional).
- [ ] **Selector de Sucursal (Frontend):**
    - [ ] Implementar selector en el Header para que el usuario elija en qué local está trabajando.
    - [ ] Persistencia: Guardar la sucursal seleccionada en el `localStorage` o `Session`.

---

## 🟡 Etapa 3: Operatividad Multi-Sede (PRÓXIMAMENTE)
*Foco: Logística y reportes compartidos.*

- [ ] **Transferencia de Stock entre Sucursales:** Módulo para mover mercadería (ej: del Depósito Central a Sucursal 1) con remito interno.
- [ ] **Reportes Consolidados:**
    - [ ] Dashboard que compare ventas entre sucursales.
    - [ ] Reporte de stock total (sumatoria de todas las sedes).
- [ ] **Asignación de Empleados a Sucursales:** Restringir que ciertos empleados solo puedan loguearse o ver datos de una sucursal específica.

---

> **Regla de Negocio:** Por defecto, todos los planes inician con 1 Sucursal. La habilitación de la segunda sucursal dispara el flujo de "Módulo Pago" o requiere upgrade de plan.
