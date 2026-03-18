using System;

namespace Application.DTOs.Sucursales;

public class SucursalDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public bool EsDepositoCentral { get; set; }
}

public class CrearSucursalRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public bool EsDepositoCentral { get; set; }
}

public class ActualizarSucursalRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public bool EsDepositoCentral { get; set; }
}
