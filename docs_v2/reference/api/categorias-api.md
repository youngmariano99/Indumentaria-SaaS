---
title: "Referencia de API: Categorías"
description: Gestión del árbol jerárquico de categorías y herencia de metadatos.
status: stable
globs: ["backend/src/Application/Features/Catalog/Categorias/**/*", "frontend/src/features/catalog/api/categoriasApi.ts"]
---

# Categorías y Jerarquía del Catálogo

Este módulo administra la clasificación de los productos y define el esquema de datos que heredarán sus variantes.

## 📡 Endpoints

### 1. Obtener Árbol de Categorías
Recupera todas las categorías activas para el inquilino.

- **URL:** `GET /api/categorias`
- **Auth:** Requerido (Bearer JWT)
- **Respuesta:** `CategoriaDto[]`

### 2. Crear nueva Categoría
Permite dar de alta una categoría, opcionalmente asignándole un `PadreId` y un esquema de metadatos JSON.

- **URL:** `POST /api/categorias`
- **Body (`CrearCategoriaDto`)**:
```typescript
interface CrearCategoriaDto {
  nombre: string;
  padreId?: string; // UUID (Cero/Nulo para categorías raíz)
  esquemaMetadatosJson?: string; // JSON Schema (Opcional)
}
```

### 3. Obtener Esquema Heredado
Resuelve el esquema de metadatos JSON sumando el esquema propio de la categoría con los esquemas de sus ancestros (Herencia Ascendente).

- **URL:** `GET /api/categorias/{id}/esquema`
- **Auth:** Requerido
- **Respuesta:** `string` (JSON string)

---

## 🏛️ Lógica de Herencia
Las categorías funcionan de forma recursiva. Si una categoría "Remeras" tiene un esquema con el campo "Temporada", todas sus subcategorías (ej: "Manga Corta", "Manga Larga") heredarán dicho campo automáticamente si no lo sobreescriben.
