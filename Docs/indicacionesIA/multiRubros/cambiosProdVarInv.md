```markdown
# Propuesta de Reestructuración: SaaS Multirrubro

Propuesta para adaptar el sistema a múltiples rubros (Indumentaria, Ferretería, Gastronomía, etc.).

## 1. Reestructuración de la Tabla Productos (El "Padre")

Eliminaremos los campos exclusivos de rubros específicos y los moveremos a un campo de metadatos general.

| Campo | Estado | Razón |
| :--- | :--- | :--- |
| `Id`, `TenantId`, `Nombre`, `Descripcion` | **BASE** | Universales para cualquier negocio. |
| `PrecioBase` | **BASE** | Todos los productos tienen un precio sugerido. |
| `CategoriaId` | **BASE** | Todos se organizan por categorías. |
| `TipoProducto` | **MODIFICAR** | Deja de ser un Enum de ropa. Ahora es un ID que apunta a la configuración del rubro. |
| `Ean13` | **BASE** | El código de barras universal es estándar. |
| `PesoKg` | **BASE** | Crítico para fletes en ferretería y envíos en ropa. |
| `Temporada`, `EscalaTalles` | **A JSONB** | Un tornillo no tiene temporada. Se mueven a `MetadatosJson`. |
| `MetadatosJson` (Nuevo) | **JSONB** | Guardará: `{"Temporada": "Invierno", "EsFraccionable": true, "UnidadMedida": "Metros"}`. |

## 2. Reestructuración de VariantesProducto (El "Hijo/SKU")

Se eliminan columnas rígidas como "Talle" y "Color" para usar un esquema dinámico.

| Campo | Estado | Razón |
| :--- | :--- | :--- |
| `Id`, `TenantId`, `ProductId` | **BASE** | Relación técnica indispensable. |
| `SKU` | **BASE** | El código único de cada variante. |
| `PrecioOverride`, `PrecioCosto` | **BASE** | Cada variante puede tener su propio costo y precio. |
| `Talle`, `Color` | **A JSONB** | Se eliminan como columnas. Ahora viven dentro de `AtributosJson`. |
| `AtributosJson` | **EL MOTOR** | **Ropa:** `{"Talle": "M", "Color": "Azul"}`<br>**Ferretería:** `{"Medida": "2 Pulgadas", "Material": "Acero"}`<br>**Repuestos:** `{"OEM": "VW-123", "Lado": "Izquierdo"}` |

## 3. La Tabla Inventario

Requiere un cambio técnico en el tipo de dato para soportar fraccionamiento:

*   **StockActual:** Debe ser de tipo `numeric` (o `decimal` en C#). Permite vender 1.5 kg de clavos o 0.75 metros de soga.
*   **StockMinimo:** También `decimal` para alertas de reposición precisas en productos fraccionables.

## Resumen de la Estructura "Móvil" (JSONB)

Ejemplo de un producto en la BD:
**Producto:** "Caño de PVC" (Ferretería)
*   **MetadatosJson:** `{"UnidadMedida": "Metros", "EsFraccionable": true}`
*   **Variante 1 (AtributosJson):** `{"Diametro": "20mm", "Pared": "Reforzada"}`
*   **Variante 2 (AtributosJson):** `{"Diametro": "40mm", "Pared": "Normal"}`

## Beneficios del Cambio

*   **Cero Migraciones Futuras:** La adición de nuevos rubros (ej. Ópticas) solo requiere nuevos pares Clave/Valor en el JSON (ej: `{"Aumento": "+1.5"}`).
*   **Consultas Rápidas:** PostgreSQL permite filtrar por campos dentro de `JSONB` con un rendimiento similar a columnas normales.
*   **Frontend Inteligente:** La interfaz reacciona al `MetadatosJson`. Si `EsFraccionable` es `true`, se habilitan decimales en el carrito.
```