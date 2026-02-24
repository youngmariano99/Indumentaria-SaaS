using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class Cliente : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public string Documento { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PreferenciasJson { get; set; } = string.Empty;
}
