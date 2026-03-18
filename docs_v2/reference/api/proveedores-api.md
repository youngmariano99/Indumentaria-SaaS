---
title: "Referencia de API: Proveedores"
description: Gestión de suministros, carga de facturas de compra y ajuste masivo de costos.
status: stable
globs: ["backend/src/Application/Features/Providers/**/*", "frontend/src/features/proveedores/api/*"]
---

# Gestión de Proveedores (Suministros)

Este módulo administra la cadena de suministro, permitiendo cargar compras de mercadería y actualizar costos de forma masiva.

## 📡 Endpoints

### 1. Obtener Lista de Proveedores
Recupera todos los proveedores asociados al inquilino.

- **URL:** `GET /api/proveedores?search=remeras`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `ProveedorDto[]`

### 2. Alta de Proveedor
Crea un nuevo contacto de suministro con sus datos fiscales (CUIT, Razón Social).

- **URL:** `POST /api/proveedores`
- **Body (`CreateProveedorCommand`)**:
```typescript
interface CreateProveedorCommand {
  nombre: string;
  razonSocial: string;
  cuit: string; // Validado contra algoritmos locales
  contacto?: string;
}
```

### 3. Carga de Factura de Compra
Registra una factura de compra para impactar en el stock y generar una deuda futura con el proveedor.

- **URL:** `POST /api/proveedores/factura`
- **Body (`RecordFacturaProveedorCommand`)**: Contiene el detalle de items comprados, cantidades y precios unitarios.

### 4. Actualización Masiva de Costos
Permite ajustar los costos de todos los productos asociados a un único proveedor por un porcentaje determinado (ej: Ante una devaluación o lista de precios nueva).

- **URL:** `POST /api/proveedores/{id}/update-costs`
- **Body**: `decimal` (El porcentaje de aumento, ej: `15.0`)

---

## 🏛️ Lógica de Suministro
Al cargar una factura de proveedor, el sistema incrementa automáticamente el stock de las variantes mencionadas en todas las sucursales involucradas en la orden de compra.
