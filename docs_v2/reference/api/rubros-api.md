---
title: "Referencia de API: Rubros (Verticales)"
description: Gestión de los rubros industriales habilitados en el sistema SaaS.
status: stable
globs: ["backend/src/API/Controllers/RubrosController.cs", "backend/src/Core/Entities/Rubro.cs"]
---

# Rubros e Industrias (Vertical SaaS)

Este módulo gestiona las diferentes industrias (Indumentaria, Ferretería, etc.) y sus metadatos dinámicos.

## 📡 Endpoints

### 1. Obtener Lista de Rubros Habilitados
Recupera todos los rubros que el sistema puede ofrecer a un nuevo inquilino.

- **URL:** `GET /api/rubros`
- **Auth:** `AllowAnonymous` (utilizado en el onboarding)
- **Respuesta:** Array de rubros simplificado:
```typescript
interface RubroRespuesta {
  id: string;     // UUID
  nombre: string; // Ej: "Ferretería"
  slug: string;   // Ej: "ferreteria"
  icono: string;  // Nombre del icono de Phosphor
}
```

---

## 🏛️ Lógica Multi-Rubro
Cada rubro de este listado contiene internamente un **Diccionario JSON** y un **Esquema de Metadatos JSON**. Cuando un inquilino se asocia a un rubro, hereda estos metadatos, los cuales son inyectados en los headers HTTP de cada respuesta para que el frontend pueda mutar su terminología y componentes dinámicamente.
