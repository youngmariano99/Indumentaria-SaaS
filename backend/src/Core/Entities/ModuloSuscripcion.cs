using System;
using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class ModuloSuscripcion : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public TipoModulo ModuloKey { get; set; }
    public bool IsActive { get; set; }
    public DateTime ValidUntil { get; set; }
}
