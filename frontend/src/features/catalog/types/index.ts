// Tipos que mapean exactamente los DTOs del backend
// Referencia: Application.DTOs.Catalog

// ──────────────────────────────────────────────────────────────────────────────
// Payload de creación (POST /api/productos/matrix)
// ──────────────────────────────────────────────────────────────────────────────

export interface VarianteDto {
    talle: string;
    color: string;
    sku: string;            // Enviar "" para que el backend lo genere automáticamente
    precioCosto: number;    // Requerido. Si no se sabe, enviar 0
    precioOverride?: number; // Opcional: precio especial para esta variante
}

export interface CrearProductoDto {
    nombre: string;
    descripcion: string;
    precioBase: number;
    categoriaId: string;    // UUID (placeholder hasta que existan categorías)
    temporada: string;
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
}

export interface ProductoConVariantes {
    id: string;
    nombre: string;
    descripcion: string;
    precioBase: number;
    temporada: string;
    variantes: VarianteResumen[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Estado interno del formulario de carga matricial (no se envía al backend)
// ──────────────────────────────────────────────────────────────────────────────

/** Una fila editable en la tabla de variantes generadas. */
export interface FilaVariante {
    talle: string;
    color: string;
    sku: string;
    precioCosto: string;    // string para el input controlado; se convierte a number al enviar
    precioOverride: string; // string para el input controlado; "" = no override
}
