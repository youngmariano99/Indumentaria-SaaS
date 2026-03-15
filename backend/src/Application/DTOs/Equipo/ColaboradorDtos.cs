using Core.Enums;

namespace Application.DTOs.Equipo;

public class ColaboradorDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public SystemRole Rol { get; set; }
    public Dictionary<string, bool> Permisos { get; set; } = new();
}

public class CrearColaboradorRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public SystemRole Rol { get; set; }
}

public class ActualizarPermisosRequest
{
    public Dictionary<string, bool> Permisos { get; set; } = new();
}
