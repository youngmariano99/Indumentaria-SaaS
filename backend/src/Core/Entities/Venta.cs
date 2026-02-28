using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class Venta : BaseEntity, IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Cajero que procesó el ticket
    public Guid UsuarioId { get; set; }
    
    public Guid MetodoPagoId { get; set; }
    public decimal Subtotal { get; set; }
    
    // Descuentos y recargos globales aplicados al ticket
    public decimal DescuentoGlobalPct { get; set; }
    public decimal DescuentoMonto { get; set; }
    public decimal RecargoGlobalPct { get; set; }
    public decimal RecargoMonto { get; set; }
    
    // Total final a pagar: Subtotal - DescuentoMonto + RecargoMonto
    public decimal MontoTotal { get; set; }
    
    public EstadoVenta EstadoVenta { get; set; } = EstadoVenta.Pendiente;
    
    // Cliente Asociado (CRM)
    public Guid? ClienteId { get; set; }
    
    // Ej: TCK-0001
    public string IdentificadorTicket { get; set; } = string.Empty;
    
    // Observaciones que el cajero quiera agregar
    public string? Notas { get; set; }
    
    // Si algún día integramos factura AFIP, podemos guardar el ID devuelto acá
    public string? CAE { get; set; } 
    public DateTime? VencimientoCAE { get; set; }

    // Navigation Properties
    public Inquilino Inquilino { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
    public MetodoPago MetodoPago { get; set; } = null!;
    public Cliente? Cliente { get; set; }
    
    public ICollection<VentaDetalle> Detalles { get; set; } = new List<VentaDetalle>();
}
