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

    // ── Metadatos Avanzados (Sprint 3.5) ──
    public decimal PesoKg { get; set; }
    public string Ean13 { get; set; } = string.Empty;
    
    /// <summary>
    /// Ej: "Nacional", "Importado"
    /// </summary>
    public string Origen { get; set; } = string.Empty; 

    /// <summary>
    /// Escala base de talles para ropa importada/calzado. Ej: "AR", "US", "EU", "UK"
    /// </summary>
    public string EscalaTalles { get; set; } = string.Empty; 
}
