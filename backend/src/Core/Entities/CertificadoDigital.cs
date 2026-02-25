using System;
using Core.Entities.Base;

namespace Core.Entities;

public class CertificadoDigital : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public string KeyVaultReference { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }
}
