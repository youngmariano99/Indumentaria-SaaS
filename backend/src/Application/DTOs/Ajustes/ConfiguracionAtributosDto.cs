namespace Application.DTOs.Ajustes;

/// <summary>
/// Atributo predefinido por tipo de producto.
/// Ej: { "clave": "Tipo de suelo", "valor": "" } — el valor puede ser un default o vacío.
/// </summary>
public class AtributoDefaultDto
{
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}

/// <summary>
/// Mapa de atributos predefinidos por tipo de producto.
/// Ej: { "Calzado": [{"clave":"Tipo de suelo","valor":""},{"clave":"Uso","valor":""}] }
/// </summary>
public class ConfiguracionAtributosDto
{
    public Dictionary<string, List<AtributoDefaultDto>> AtributosPorTipo { get; set; } = new();
}
