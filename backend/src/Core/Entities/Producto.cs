using System;
using Core.Entities.Base;

namespace Core.Entities;

public class Producto : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    
    public decimal PrecioBase { get; set; }
    
    public Guid CategoriaId { get; set; }
    public string Temporada { get; set; } = string.Empty;
}
