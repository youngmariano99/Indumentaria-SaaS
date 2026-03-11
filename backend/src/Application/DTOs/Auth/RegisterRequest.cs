using System;

namespace Application.DTOs.Auth;

public class RegisterRequest
{
    public string NombreComercial { get; set; } = string.Empty;
    public string Subdominio { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? RubroId { get; set; }
}
