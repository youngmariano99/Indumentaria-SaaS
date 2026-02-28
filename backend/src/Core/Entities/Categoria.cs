using Core.Entities.Base;

namespace Core.Entities;

public class Categoria : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    
    // NCM (Nomenclatura Común del Mercosur)
    public string Ncm { get; set; } = string.Empty;

    // Jerarquía (Árbol de categorías)
    public Guid? ParentId { get; set; }
    
    public bool IsDeleted { get; set; }
}
