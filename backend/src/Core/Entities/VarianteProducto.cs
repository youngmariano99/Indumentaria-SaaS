using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class VarianteProducto : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid ProductoId { get; set; }
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal? PrecioModificado { get; set; }
}
