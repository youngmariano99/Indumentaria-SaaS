# Integración Frontend - APIRest (SaaS Indumentaria)
**Módulo:** Catálogo y Matriz de Stock (Sprint 3)

Este documento define el contrato de datos y provee recomendaciones de UX/UI para el desarrollador Frontend encargado de construir la pantalla de "Alta de Productos".

---

## 1. Patrón de Diseño Recomendado (UX/UI)
En Indumentaria, cargar productos uno por uno es inviable. El estándar de la industria es la **Carga Matricial (Bulk Import Visual)**.

**¿Cómo debería verse la pantalla de "Nuevo Producto"?**
1.  **Cabecera del Producto (Datos Base):**
    *   Input: `Nombre` (ej: "Jeans Duko")
    *   Input: `Descripción` (ej: "Corte Mom")
    *   Select: `Temporada` (Otoño-Invierno 2026)
    *   Input Numérico: `PrecioBase` (El precio de venta predeterminado, ej: $25000)
    *   *Sugerencia:* `CategoriaId` debería ser un desplegable que se alimente de un endpoint `/api/categorias` (a implementar).

2.  **Generador Dinámico de Variantes (La Matriz):**
    *   Input de Chips para **Talles**: El usuario escribe "S", aprieta enter, luego "M", "L".
    *   Input de Chips para **Colores**: El usuario escribe "Azul", "Negro".
    *   **Magia Reactiva:** Al cambiar estos chips, un `useEffect` en React debe generar una tabla (o grilla de cards) donde cada fila es una combinación posible (S-Azul, S-Negro, M-Azul, etc.).

3.  **La Grilla Resultante:**
    En esa grilla, por cada variante generada, el usuario debe tener inputs *opcionales* para:
    *   `SKU` (Código de Barras único de esa combinación).
    *   `PrecioCosto` (Lo que le costó al dueño comprar esa variante, ej: la tela del talle XXL le salió más cara).
    *   `PrecioOverride` (Si quiere que un talle/color específico cueste distinto al `PrecioBase` de la cabecera).

---

## 2. Contrato TypeScript (Interfaces)

Debes armar este JSON final y enviarlo al endpoint. Crea estas interfaces en tu módulo `features/catalog/types`.

```typescript
export interface VarianteDto {
  talle: string;
  color: string;
  sku: string;         // Enviar string vacío "" si no tiene
  precioCosto: number; // Requerido (0 si no lo sabe)
  precioOverride?: number; // Opcional (undefined o null si respeta el PrecioBase)
}

export interface CrearProductoDto {
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoriaId: string; // UUID
  temporada: string;
  variantes: VarianteDto[];
}
```

---

## 3. Endpoints a Consumir

**Endpoint de Creación:**
*   **URL:** `POST /api/productos/matrix`
*   **Body:** Objeto `CrearProductoDto`.
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <TU_JWT_TOKEN>` *(El `apiClient` ya hace esto automáticamente).*

**Respuestas Esperables:**
*   `201 Created`: Todo salió perfecto. PostgreSQL guardó el producto base y N variantes ligadas a él.
*   `400 Bad Request`: Validaciones de FluentValidation fallaron. El Backend devolverá un JSON con los errores específicos, por ejemplo:
    *   *"El PrecioBase debe ser mayor a 0"*.
    *   *"La variante [M-Azul] no tiene un SKU y el sistema está configurado para requerirlo"*.

---

## 4. Notas Importantes sobre el "Precio"
De acuerdo a las reglas de negocio, **el Catálogo NO debe tener campos para recargos o descuentos por método de pago** (Ej: "Precio Tarjeta", "Precio Contado").

*   **¿Por qué?** Porque en sistemas contables serios, el *Producto* es el bien físico con un valor nominal. Los recargos o descuentos son conceptos financieros que suceden en la **transacción comercial (Venta/Comprobante)**.
*   **¿Cómo se abordará?** Cuando desarrolles el módulo de *Punto de Venta (POS)* en el Sprint 4, luego de que el cajero seleccione los productos, habrá un botón para "Elegir Método de Pago". Allí se aplicará el porcentaje de interés de la tarjeta o el descuento por efectivo de forma dinámica al *Comprobante*. El producto base no sufre modificaciones.

---

## 5. Diseño Arquitectónico: Carga por Matriz vs. Carga por SKU Individual

Durante el diseño de la API, tomamos la decisión consciente de implementar la **Carga Matricial (Variantes vinculadas a un Entidad Padre)** en lugar de la **Carga por SKU Plana** (donde cada talle/color es un producto totalmente independiente).

### Diferencias Clave

1.  **Enfoque SKU Individual (El que NO usamos):**
    *   *Cómo es:* Creas "Remera Blanca S", luego "Remera Blanca M", luego "Remera Blanca L" como tres productos `Producto` distintos en la base de datos.
    *   *Desventajas:* Repetición masiva de datos (descripción, categoría, temporada). Si quieres cambiarle el nombre a la "Remera Blanca" o actualizar su precio base, tienes que buscar y editar los 3 o 4 productos por separado. Ensucia visualmente el catálogo del cliente.

2.  **Enfoque de Matriz (El que SÍ implementamos):**
    *   *Cómo es:* Creas **1 solo** `Producto` "Remera Blanca" (Entidad Padre) con sus descripciones generales y un precio base transversal. Luego asocias **N** `VarianteProducto` (Entidad Hija) que solo contienen las diferencias (Talle, Color, SKU único, y diferencias opcionales de precio o costo).
    *   *Ventajas:* Normalización de base de datos. Modificas la descripción del padre y se refleja mágicamente en todas las variantes. El punto de venta puede agrupar las ventas bajo un mismo "Producto Padre" para reportes estadísticos claros (Ej: "Vendiste 50 Remeras Blancas, de las cuales 30 fueron L y 20 fueron M").

### ¿Por qué lo hicimos así y cuáles son los beneficios?
*   **Velocidad operativa para el usuario (UX):** Un dueño de local de ropa no tiene tiempo para tipear 15 veces el mismo nombre de pantalón al cambiar de talle. Carga el "Pantalón Cargo" una vez, tilda los talles y colores en la pantalla, y el Backend crea automáticamente los 15 registros de stock subyacentes mediante el cruce de datos en una sola petición a la base de datos.
*   **Reportes Inteligentes:** Permite saber fácilmente cuál producto general es "el más vendido" y, a su vez, hacer *drill-down* para ver qué variante exacta (talle/color) de ese producto fue la estrella.
*   **Escalabilidad E-Commerce:** Esta estructura es idéntica a cómo funcionan plataformas como Shopify o Tienda Nube, lo que nos preparará para futuras integraciones sin fricción.
