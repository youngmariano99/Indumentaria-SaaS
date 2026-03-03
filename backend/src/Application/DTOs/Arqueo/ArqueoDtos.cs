using System;

namespace Application.DTOs.Arqueo;

public class ArqueoDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string StoreNombre { get; set; } = string.Empty;
    public Guid UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public DateTime FechaApertura { get; set; }
    public DateTime? FechaCierre { get; set; }
    public decimal SaldoInicial { get; set; }
    public decimal TotalVentasEsperado { get; set; }
    public decimal TotalManualEsperado { get; set; }
    public decimal TotalRealContado { get; set; }
    public decimal Diferencia { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public List<ArqueoDetalleDto> Detalles { get; set; } = new();
}

public class ArqueoDetalleDto
{
    public Guid MetodoPagoId { get; set; }
    public string MetodoPagoNombre { get; set; } = string.Empty;
    public decimal MontoEsperado { get; set; }
    public decimal MontoReal { get; set; }
    public decimal Diferencia { get; set; }
}

public class AbrirCajaDto
{
    public Guid StoreId { get; set; }
    public decimal SaldoInicial { get; set; }
}

public class CerrarCajaDto
{
    public string? Observaciones { get; set; }
    public List<CerrarCajaDetalleDto> DetallesReales { get; set; } = new();
}

public class CerrarCajaDetalleDto
{
    public Guid MetodoPagoId { get; set; }
    public decimal MontoReal { get; set; }
}
