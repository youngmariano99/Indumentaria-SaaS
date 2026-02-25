using System;
using Core.Entities.Base;

namespace Core.Entities;

public class Inventario : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    public Guid ProductVariantId { get; set; }
    
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
}
