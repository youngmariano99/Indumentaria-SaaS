using System;
using Core.Entities.Base;

namespace Core.Entities;

public class BilleteraVirtual : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    
    public decimal SaldoActual { get; set; }
}
