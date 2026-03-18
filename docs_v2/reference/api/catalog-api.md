---
title: "Referencia de API: Catálogo y Matriz de Stock"
description: Contratos de datos, endpoints y lógica de integración para el módulo de Catálogo.
status: stable
globs: ["backend/src/Application/Features/Catalog/**/*", "frontend/src/features/catalog/api/*"]
---

# Catálogo y Matriz de Stock (API Integration)

Este documento define la interfaz técnica entre el Frontend (React) y el Backend (.NET) para la gestión del catálogo.

## 📡 Endpoints

### 1. Creación Matricial de Productos
Permite crear un producto base y todas sus variantes relacionadas en una única transacción atómica.

- **URL:** `POST /api/productos/matrix`
- **Auth:** Requerido (Bearer JWT)
- **Content-Type:** `application/json`

#### Payload (`CrearProductoDto`)
```typescript
interface CrearProductoDto {
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoriaId: string; // UUID
  temporada: string;
  variantes: VarianteDto[];
}

interface VarianteDto {
  talle: string;
  color: string;
  sku: string;             // Vacío si no tiene
  precioCosto: number;     // Obligatorio
  precioOverride?: number; // Opcional
}
```

#### Respuestas
- **201 Created**: Producto y variantes creados exitosamente.
- **400 Bad Request**: Error de validación (ej: `PrecioBase <= 0`).

---

## 🧠 Lógica de Integración

### Carga Matricial vs Plana
El sistema utiliza un enfoque de **Entidad Padre (Producto)** y **Entidades Hijas (Variantes)**.
- **Ventaja**: El Frontend genera la grilla de variantes dinámicamente basándose en la selección de talles/colores (Chips), enviando un solo objeto complejo al servidor.
- **Sincronización**: Al actualizar el "Precio Base" del padre, todas las variantes que no tengan `precioOverride` se actualizan automáticamente.

### Reglas de Negocio del Catálogo
- **Agnosticismo Financiero**: El catálogo solo almacena el valor nominal del producto. Los descuentos o recargos por método de pago se aplican exclusivamente en el módulo de Ventas (Checkout).
