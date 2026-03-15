using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class PagoProveedor : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ProveedorId { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal MontoTotal { get; set; }
    public string? Notas { get; set; }

    public bool IsDeleted { get; set; }

    // En un futuro se puede expandir para manejar múltiples métodos de pago (Efectivo, Cheque, Transferencia)
    // Por ahora simplificamos vinculando a un MetodoPago existente si se desea.
    public Guid? MetodoPagoId { get; set; }
    
    // Navigation
    public virtual Proveedor Proveedor { get; set; } = null!;
    public virtual MetodoPago? MetodoPago { get; set; }
    public virtual ICollection<DistribucionPagoFactura> DistribucionesFacturas { get; set; } = new List<DistribucionPagoFactura>();
    public virtual ICollection<ChequeTercero> ChequesEntregados { get; set; } = new List<ChequeTercero>();
}
