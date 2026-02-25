using System;
using Core.Entities.Base;

namespace Core.Entities;

public class VarianteProducto : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    
    public string SKU { get; set; } = string.Empty; // Código de barras
    public decimal? PrecioOverride { get; set; } // Opcional: sobreescribe PrecioBase
}
