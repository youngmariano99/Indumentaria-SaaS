using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class BilleteraVirtual : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid ClienteId { get; set; }
    public decimal SaldoActual { get; set; }
}
