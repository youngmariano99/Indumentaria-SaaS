using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class MetodoPago : BaseEntity, IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public bool RequiereAprobacionAdmin { get; set; } = false;
    public bool Activo { get; set; } = true;
    
    // Relaciones
    public Inquilino Inquilino { get; set; } = null!;
}
