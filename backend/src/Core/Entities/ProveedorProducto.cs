using Core.Entities.Base;

namespace Core.Entities;

public class ProveedorProducto : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid ProveedorId { get; set; }
    public Guid ProductoId { get; set; }
    
    public string VendorSku { get; set; } = string.Empty;
    public decimal Costo { get; set; }
    public int LeadTimeDays { get; set; } // Tiempo de entrega en días

    // Navigation
    public virtual Proveedor Proveedor { get; set; } = null!;
    public virtual Producto Producto { get; set; } = null!;
}
