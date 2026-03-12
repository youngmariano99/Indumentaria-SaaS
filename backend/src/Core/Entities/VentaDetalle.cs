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
    public decimal Cantidad { get; set; }
    
    // Congela el precio pagado en caso de inflación futura
    public decimal PrecioUnitarioAplicado { get; set; }
    
    // Congela el costo al momento de la venta para reportes de rentabilidad exactos
    public decimal CostoUnitarioAplicado { get; set; }

    // Desglose impositivo para reporte de IVA Digital
    public decimal AlicuotaIvaPct { get; set; } = 21; // Por defecto 21%
    public decimal MontoIvaTotal { get; set; }

    // Cantidad * PrecioUnitarioAplicado
    public decimal SubtotalLinea { get; set; }
    
    // Navigation Properties
    public Venta Venta { get; set; } = null!;
    public VarianteProducto VarianteProducto { get; set; } = null!;

    // Indica si el producto fue marcado en el POS como posible cambio
    public bool PosibleDevolucion { get; set; } = false;
}
