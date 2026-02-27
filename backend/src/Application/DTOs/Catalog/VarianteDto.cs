namespace Application.DTOs.Catalog;

public class VarianteDto
{
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;         // Enviar "" para auto-generación
    public decimal PrecioCosto { get; set; }                // Requerido (0 si no se sabe)
    public decimal? PrecioOverride { get; set; }            // Opcional

    /// <summary>Cantidad inicial de unidades en stock para esta variante.</summary>
    public int StockInicial { get; set; } = 0;

    /// <summary>Atributos adicionales clave/valor. Ej: {"Uso":"F11","Material":"Cuero"}</summary>
    public Dictionary<string, string> Atributos { get; set; } = new();
}
