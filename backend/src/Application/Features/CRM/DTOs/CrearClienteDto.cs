using Core.Enums;

namespace Application.Features.CRM.DTOs;

public class CrearClienteDto
{
    public string Documento { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public CondicionIva? CondicionIva { get; set; }
    public string PreferenciasJson { get; set; } = "{}";
}
