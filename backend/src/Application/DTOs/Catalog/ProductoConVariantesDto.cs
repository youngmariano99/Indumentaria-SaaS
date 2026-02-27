namespace Application.DTOs.Catalog;

/// <summary>Producto con sus variantes para la respuesta del listado del catálogo.</summary>
public class ProductoConVariantesDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public string Temporada { get; set; } = string.Empty;
    public List<VarianteResumenDto> Variantes { get; set; } = new();
}
