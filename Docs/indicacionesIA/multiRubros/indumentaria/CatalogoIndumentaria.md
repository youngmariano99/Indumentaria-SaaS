Actúa como un Arquitecto de Software Principal y Desarrollador Full-Stack Senior. Estamos construyendo el módulo de CATÁLOGO para el rubro "Indumentaria" dentro de nuestro SaaS Multi-Todo (.NET 8/9, PostgreSQL con JSONB, React PWA).

El objetivo de este módulo es resolver la complejidad de la "Explosión de SKUs" en la moda. Un solo modelo (ej. Remera Duko) puede tener 15 variantes (5 talles x 3 colores). La UX debe basarse en la **Carga Matricial** y la visualización de "Curvas de Stock".

---

## 🏗️ 1. BACKEND: MOTOR DE VARIANTES Y PRECIOS

### Generador de Curva de Talles (Combinatoria Automática)
Escribe un comando MediatR (`GenerarCurvaIndumentariaCommand`) que reciba un ProductoPadreId y dos arrays: `Talles[]` y `Colores[]`.
- **Lógica**: Debe realizar el producto cartesiano entre ambos arrays.
- **Persistencia**: Por cada combinación, debe crear una fila en `VariantesProducto` con un SKU autogenerado (ej: `PROD-TALLE-COLOR`).

### Regla de Precios "Padre-Hijo"
- **Precio Base**: El ProductoPadre define el precio nominal.
- **Overrides**: La tabla `VariantesProducto` debe soportar un campo `PrecioOverride`. Si es NULL, el sistema usa el del padre. Si tiene valor, se prioriza (ej: talle XXL es más caro).
- **Consistencia**: Al actualizar el precio del padre, todas las variantes "hijas" se ven afectadas instantáneamente, ahorrando miles de clics al dueño del local.

---

## 🎨 2. FRONTEND (React): UI DE MATRIZ DE STOCK

### El Generador de Chips (Entrada Rápida)
Diseña un componente `ChipInputGrid` donde el usuario escriba los talles (S, M, L) y colores rápidamente. Al confirmar, debe renderizar automáticamente...

### La Grilla Matricial (Matrix View)
NO uses una lista plana. Diseña una **Grilla de Doble Entrada**:
- **Filas**: Colores.
- **Columnas**: Talles.
- **Celdas**: Input de Stock Actual.
- Es vital que el usuario pueda cargar el stock de toda la "curva" (ej: 10 de cada talle) en una sola pantalla antes de guardar.

### Tags y Temporadas
Incluye un sistema de etiquetas dinámicas (Tags) para filtrar el catálogo por:
- **Temporada**: PV2026, OI2026.
- **Colección**: Cápsula, Básicos, Liquidación.

---

## 🛡️ 3. RESTRICCIONES DE NEGOCIO (Multi-Tenant)

- **RLS Obligatorio**: Todas las consultas de catálogo deben pasar por el interceptor `TenantId`.
- **Zero Placeholder**: No permitas crear productos sin al menos una categoría asignada.
- **Agnosticismo de UI**: El componente debe leer el `DiccionarioJson` del inquilino. Si el rubro dice "Talle", la etiqueta debe decir "Talle". Si en el futuro mutamos a un rubro que usa "Medida", el componente debe ajustarse sin cambiar el código `React`.
