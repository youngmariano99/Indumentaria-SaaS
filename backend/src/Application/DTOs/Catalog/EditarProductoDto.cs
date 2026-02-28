using Core.Enums;

namespace Application.DTOs.Catalog;

public class EditarProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public Guid CategoriaId { get; set; }
    public string Temporada { get; set; } = string.Empty;
    public TipoProducto TipoProducto { get; set; } = TipoProducto.Ropa;

    // Solo se manda la actualización de variables existentes (Precios / Atributos). 
    // Para simplificar el ABM intermedio de catálogo.
    public List<VarianteEdicionDto> Variantes { get; set; } = new();
}

public class VarianteEdicionDto
{
    public Guid Id { get; set; }                            // Identificador para mapear a DB
    public decimal PrecioCosto { get; set; }
    public decimal? PrecioOverride { get; set; }
    public Dictionary<string, string> Atributos { get; set; } = new();
}
