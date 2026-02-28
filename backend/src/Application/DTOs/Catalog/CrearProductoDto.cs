using Core.Enums;

namespace Application.DTOs.Catalog;

public class CrearProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public Guid CategoriaId { get; set; }
    public string Temporada { get; set; } = string.Empty;

    /// <summary>Tipo de producto para determinar la grilla de talles.</summary>
    public TipoProducto TipoProducto { get; set; } = TipoProducto.Ropa;

    public decimal PesoKg { get; set; }
    public string Ean13 { get; set; } = string.Empty;
    public string Origen { get; set; } = string.Empty;
    public string EscalaTalles { get; set; } = string.Empty;

    public List<VarianteDto> Variantes { get; set; } = new();
}
