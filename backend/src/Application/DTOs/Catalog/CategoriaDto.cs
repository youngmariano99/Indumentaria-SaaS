namespace Application.DTOs.Catalog;

public class CategoriaDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CodigoNcm { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    
    // Lista de subcategorías para representar el árbol
    public List<CategoriaDto> Subcategorias { get; set; } = new();
}
