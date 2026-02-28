namespace Application.DTOs.Catalog;

public class CrearCategoriaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CodigoNcm { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
}
