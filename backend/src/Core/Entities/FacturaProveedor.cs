using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class FacturaProveedor : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ProveedorId { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public DateTime FechaVencimiento { get; set; }
    
    public decimal MontoTotal { get; set; }
    public decimal SaldoPendiente { get; set; } // BalanceDue
    
    // Preparación Estructural para OCR/IA
    public OrigenFactura Origen { get; set; } = OrigenFactura.Manual;
    public string? DocumentoUrl { get; set; }
    public string? MetadatosRawJsonb { get; set; } // JSONB en Postgres
    public EstadoProcesamientoFactura EstadoProcesamiento { get; set; } = EstadoProcesamientoFactura.Confirmado;

    public bool IsDeleted { get; set; }

    // Navigation
    public virtual Proveedor Proveedor { get; set; } = null!;
    public virtual ICollection<DistribucionPagoFactura> DistribucionesPago { get; set; } = new List<DistribucionPagoFactura>();
}
