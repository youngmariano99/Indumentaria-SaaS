using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class ModuloSuscripcion : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public ModuloKey ModuloActivo { get; set; }
    public bool EsActivo { get; set; }
    public DateTime? ValidoHasta { get; set; }
}
