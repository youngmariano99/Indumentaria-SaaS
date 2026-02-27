using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class VentaDetalle : BaseEntity, IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    public Guid VentaId { get; set; }
    public Guid VarianteProductoId { get; set; }
    
    // Cuántas unidades de la variante compraron
    public int Cantidad { get; set; }
    
    // Congela el precio pagado en caso de inflación futura
    public decimal PrecioUnitarioAplicado { get; set; }
    
    // Cantidad * PrecioUnitarioAplicado
    public decimal SubtotalLinea { get; set; }
    
    // Navigation Properties
    public Venta Venta { get; set; } = null!;
    public VarianteProducto VarianteProducto { get; set; } = null!;
}
