using System;
using Core.Enums;

namespace Application.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public SystemRole Rol { get; set; }
}
