namespace Application.DTOs.Ajustes;

/// <summary>
/// Mapa de talles personalizados por tipo de producto.
/// Ejemplo: { "Ropa": ["XS","S","M","L"], "Calzado": ["38","39","40"] }
/// Si un tipo no está en el diccionario, el frontend usa los defaults de tallesPorTipo.ts.
/// </summary>
public class ConfiguracionTallesDto
{
    public Dictionary<string, List<string>> TallesPorTipo { get; set; } = new();
}
