namespace Application.DTOs.Catalog;

public class VarianteDto
{
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal PrecioCosto { get; set; }
    public decimal? PrecioOverride { get; set; }
}
