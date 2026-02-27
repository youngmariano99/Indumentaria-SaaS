// Tipos que mapean exactamente los DTOs del backend
// Referencia: Application.DTOs.Catalog

// Enum que replica Core.Enums.TipoProducto del backend
export type TipoProductoKey = "Ropa" | "Calzado" | "Accesorio" | "RopaInterior" | "Deporte" | "RopaDeTrabajo";

// ──────────────────────────────────────────────────────────────────────────────
// Payload de creación (POST /api/productos/matrix)
// ──────────────────────────────────────────────────────────────────────────────

export interface VarianteDto {
    talle: string;
    color: string;
    sku: string;            // Enviar "" para que el backend lo genere automáticamente
    precioCosto: number;    // Requerido. Si no se sabe, enviar 0
    precioOverride?: number; // Opcional: precio especial para esta variante
    stockInicial: number;   // Unidades iniciales en stock (crea registro en Inventario)
    atributos: Record<string, string>; // {"Uso":"F11","Material":"Cuero"}
}

export interface CrearProductoDto {
    nombre: string;
    descripcion: string;
    precioBase: number;
    categoriaId: string;    // UUID (placeholder hasta que existan categorías)
    temporada: string;      // Puede ser vacío ""
    tipoProducto: string;   // Valor del enum TipoProducto (ej: "Ropa", "Calzado")
    variantes: VarianteDto[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de respuesta del backend (GET /api/productos)
// ──────────────────────────────────────────────────────────────────────────────

export interface VarianteResumen {
    id: string;
    talle: string;
    color: string;
    sku: string;
    precioCosto: number;
    precioOverride?: number;
    stockActual: number;    // Desde tabla Inventario
}

export interface ProductoConVariantes {
    id: string;
    nombre: string;
    descripcion: string;
    precioBase: number;
    temporada: string;
    tipoProducto: string;   // Valor del enum TipoProducto
    variantes: VarianteResumen[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Estado interno del formulario de carga matricial (no se envía al backend)
// ──────────────────────────────────────────────────────────────────────────────

/** Par clave/valor para atributos adicionales de una variante. */
export interface AtributoKV {
    clave: string;
    valor: string;
}

/** Una fila editable en la tabla de variantes generadas. */
export interface FilaVariante {
    talle: string;
    color: string;
    sku: string;
    precioCosto: string;    // string para el input controlado; se convierte a number al enviar
    precioOverride: string; // string; "" = no override
    stockInicial: string;   // string; se convierte a int al enviar
}
