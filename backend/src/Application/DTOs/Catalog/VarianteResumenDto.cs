namespace Application.DTOs.Catalog;

/// <summary>Variante de un producto para la respuesta del listado del catálogo.</summary>
public class VarianteResumenDto
{
    public Guid Id { get; set; }
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal PrecioCosto { get; set; }
    public decimal? PrecioOverride { get; set; }
    public int StockActual { get; set; }  // Viene de la tabla Inventario
}
