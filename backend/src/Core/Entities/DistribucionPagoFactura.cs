using Core.Entities.Base;

namespace Core.Entities;

public class DistribucionPagoFactura : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid PagoProveedorId { get; set; }
    public Guid FacturaProveedorId { get; set; }
    
    public decimal MontoAsignado { get; set; }

    // Navigation
    public virtual PagoProveedor PagoProveedor { get; set; } = null!;
    public virtual FacturaProveedor FacturaProveedor { get; set; } = null!;
}
