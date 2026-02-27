using Core.Entities.Base;

namespace Core.Entities;

public class Inquilino : BaseEntity
{
    public string NombreComercial { get; set; } = string.Empty;
    public string CUIT { get; set; } = string.Empty;
    public string Subdominio { get; set; } = string.Empty;
    public string ConfiguracionRegional { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Configuración de talles personalizada por tipo de producto.
    /// JSON: {"Ropa": ["XS","S","M"], "Calzado": ["38","39"]}
    /// </summary>
    public string ConfiguracionTallesJson { get; set; } = "{}";

    /// <summary>
    /// Atributos predefinidos por tipo de producto para pre-cargar en el formulario.
    /// JSON: {"Calzado": [{"clave":"Tipo de suelo","valor":""},{"clave":"Uso","valor":""}]}
    /// </summary>
    public string ConfiguracionAtributosJson { get; set; } = "{}";
}
