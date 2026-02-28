namespace Application.DTOs.Catalog;

public class EditarCategoriaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CodigoNcm { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
}
