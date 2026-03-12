using System;
using Core.Entities.Base;

namespace Core.Entities;

public class AtributoConfiguracion : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    
    /// <summary>
    /// Grupo al que pertenece el atributo (ej: "Material", "Medida", "Presentacion").
    /// </summary>
    public string Grupo { get; set; } = string.Empty;
    
    /// <summary>
    /// Valor específico del atributo (ej: "Acero", "1/2 pulgada", "Blister").
    /// </summary>
    public string Valor { get; set; } = string.Empty;
    
    /// <summary>
    /// Orden visual para mostrar en interfaces.
    /// </summary>
    public int Orden { get; set; } = 0;

    public bool IsDeleted { get; set; }
}
