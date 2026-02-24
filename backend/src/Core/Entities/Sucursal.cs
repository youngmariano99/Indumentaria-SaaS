using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class Sucursal : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public bool EsDepositoCentral { get; set; }
}
