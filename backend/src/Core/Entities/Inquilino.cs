using Core.Entities.Base;

namespace Core.Entities;

public class Inquilino : BaseEntity
{
    public string NombreComercial { get; set; } = string.Empty;
    public string CUIT { get; set; } = string.Empty;
    public string Subdominio { get; set; } = string.Empty;
    public string ConfiguracionRegional { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
