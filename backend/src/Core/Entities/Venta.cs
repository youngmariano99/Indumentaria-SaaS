using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class Venta : BaseEntity, IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    // Cajero que procesó el ticket
    public Guid UsuarioId { get; set; }
    
    public Guid MetodoPagoId { get; set; }
    
    public decimal MontoTotal { get; set; }
    
    public EstadoVenta EstadoVenta { get; set; } = EstadoVenta.Pendiente;
    
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
    
    public ICollection<VentaDetalle> Detalles { get; set; } = new List<VentaDetalle>();
}
