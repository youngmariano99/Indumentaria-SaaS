using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class Proveedor : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string RazonSocial { get; set; } = string.Empty;
    public string NombreFantasia { get; set; } = string.Empty;
    public string Cuit { get; set; } = string.Empty;
    public CondicionIva CondicionIva { get; set; } = CondicionIva.ResponsableInscripto;
    
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    
    public decimal Saldo { get; set; } // Saldo acumulado (positivo = saldo a favor, negativo = deuda)
    public decimal PorcentajeRecargo { get; set; } // % de recargo global para este proveedor
    
    public bool IsDeleted { get; set; }
    
    // Navigation
    public virtual ICollection<FacturaProveedor> Facturas { get; set; } = new List<FacturaProveedor>();
    public virtual ICollection<ProveedorProducto> ProductosSuministrados { get; set; } = new List<ProveedorProducto>();
}
