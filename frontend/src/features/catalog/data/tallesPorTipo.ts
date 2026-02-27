/**
 * Talles predefinidos por tipo de producto.
 * Fuente: Docs/indicacionesIA/Talles.md
 *
 * El usuario puede agregar/quitar chips libremente; estos son los valores por defecto
 * que se pre-cargan al seleccionar el tipo de producto en el formulario.
 */

export const TALLES_POR_TIPO: Record<string, string[]> = {
    Ropa: [
        // Talles internacionales adultos
        "XS", "S", "M", "L", "XL", "XXL", "3XL",
        // Talles numéricos (niños/talles especiales ropa)
        "1", "2", "3", "4", "6", "8", "10", "12", "14", "16",
    ],

    Calzado: [
        // Escala Argentina / Europa (calzado)
        "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45",
    ],

    Accesorio: [
        "Único",
        "XS/S", "M/L",
        "S", "M", "L",
    ],

    RopaInterior: [
        // Talles generales
        "XS", "S", "M", "L", "XL", "XXL",
        // Corpiños (copa + contorno)
        "Copa A", "Copa B", "Copa C", "Copa D",
        "80A", "80B", "80C", "85A", "85B", "85C", "90A", "90B", "90C",
    ],

    Deporte: [
        "XS", "S", "M", "L", "XL", "XXL", "3XL",
    ],

    RopaDeTrabajo: [
        // Talles alfanuméricos + numéricos amplios
        "S", "M", "L", "XL", "XXL", "3XL",
        "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60",
    ],
};

/** Nombre legible para mostrar en el selector del formulario */
export const NOMBRE_TIPO: Record<string, string> = {
    Ropa: "Ropa",
    Calzado: "Calzado",
    Accesorio: "Accesorio",
    RopaInterior: "Ropa Interior",
    Deporte: "Deporte",
    RopaDeTrabajo: "Ropa de Trabajo",
};

/** Lista ordenada de tipos para usar en el <select> */
export const TIPOS_PRODUCTO = Object.keys(TALLES_POR_TIPO) as (keyof typeof TALLES_POR_TIPO)[];
