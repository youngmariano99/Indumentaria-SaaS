using System;
using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class Usuario : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
    public string? PinCodeHash { get; set; } // Para acceso rápido en POS
    
    public SystemRole Rol { get; set; }

    /// <summary>
    /// Sobrescritura de funcionalidades activas/desactivas para este usuario.
    /// </summary>
    public string FeaturesJson { get; set; } = "{}";
}
