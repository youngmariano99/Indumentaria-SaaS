using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class ChequeTercero : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string NumeroCheque { get; set; } = string.Empty;
    public string Banco { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public DateTime FechaCobro { get; set; }
    public decimal Importe { get; set; }
    
    public string Emisor { get; set; } = string.Empty;
    
    // Máquina de Estados (FSM)
    public EstadoChequeTercero Estado { get; set; } = EstadoChequeTercero.En_Cartera;

    public bool IsDeleted { get; set; }

    // Si fue entregado a un proveedor
    public Guid? PagoProveedorId { get; set; }
    
    // Navigation
    public virtual PagoProveedor? PagoProveedor { get; set; }
}
