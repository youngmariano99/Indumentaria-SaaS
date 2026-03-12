using Core.Entities.Base;

namespace Core.Entities;

/// <summary>
/// Representa el rubro o sector comercial de un inquilino (ej: Indumentaria, Ferretería, Gastronomía).
/// Define cómo se traducen los conceptos base del sistema para el usuario final.
/// </summary>
public class Rubro : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty; // Identificador técnico (ej: "ferreteria", "indumentaria")
    public string Icono { get; set; } = string.Empty;

    /// <summary>
    /// Diccionario de términos dinámicos en formato JSON.
    /// Ej: {"Producto": "Prenda", "Talle": "Tamaño", "Color": "Tono"}
    /// </summary>
    public string DiccionarioJson { get; set; } = "{}";

    /// <summary>
    /// Esquema de metadatos sugeridos para este rubro.
    /// Define qué campos extra debería tener un Producto por defecto.
    /// </summary>
    public string EsquemaMetadatosJson { get; set; } = "{}";

    /// <summary>
    /// Configuración de funcionalidades activas/desactivas para este rubro.
    /// JSON: {"ModuloCRM": true, "MatrizTalles": true}
    /// </summary>
    public string FeaturesJson { get; set; } = "{}";

    public bool Activo { get; set; } = true;
}
