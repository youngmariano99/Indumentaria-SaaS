using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class Producto : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public decimal PrecioBase { get; set; }

    public Guid CategoriaId { get; set; }
    public string Temporada { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de producto que determina la grilla de talles disponibles.
    /// Referencia: Core.Enums.TipoProducto
    /// </summary>
    public TipoProducto TipoProducto { get; set; } = TipoProducto.Ropa;

    public bool IsDeleted { get; set; }
}
