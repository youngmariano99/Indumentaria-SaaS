using System;
using Core.Entities.Base;

namespace Core.Entities;

public class Sucursal : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    
    public bool EsDepositoCentral { get; set; }

    /// <summary>
    /// Sobrescritura de funcionalidades activas/desactivas para esta sucursal.
    /// </summary>
    public string FeaturesJson { get; set; } = "{}";
}
