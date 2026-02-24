using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class CertificadoDigital : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public string KeyVaultReference { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
}
