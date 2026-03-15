using System;

namespace Application.Features.Providers.DTOs;

public class ProveedorDto
{
    public Guid Id { get; set; }
    public string RazonSocial { get; set; } = null!;
    public string Documento { get; set; } = null!; // CUIT
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public decimal Saldo { get; set; }
    public decimal PorcentajeRecargo { get; set; }
}
