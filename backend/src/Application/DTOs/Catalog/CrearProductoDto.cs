namespace Application.DTOs.Catalog;

public class CrearProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public Guid CategoriaId { get; set; }
    public string Temporada { get; set; } = string.Empty;
    public List<VarianteDto> Variantes { get; set; } = new();
}
