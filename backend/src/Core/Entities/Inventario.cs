using System;
using Core.Entities.Base;

namespace Core.Entities;

public class Inventario : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    public Guid ProductVariantId { get; set; }
    
    public decimal StockActual { get; set; }
    public decimal StockMinimo { get; set; }
    public decimal StockDefectuoso { get; set; }
    public decimal StockRevision { get; set; }

    // Navigation
    public virtual VarianteProducto VarianteProducto { get; set; } = null!;
}
