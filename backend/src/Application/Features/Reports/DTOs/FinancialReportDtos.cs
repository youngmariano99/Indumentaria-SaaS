using System;

namespace Application.Features.Reports.DTOs;

public class AgingReportDto
{
    public Guid ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal DeudaTotal { get; set; }
    public DateTime? UltimoMovimiento { get; set; }
    public int DiasDeuda => UltimoMovimiento.HasValue ? (DateTime.UtcNow - UltimoMovimiento.Value).Days : 0;
}

public class CajaDetalleFerreteriaDto
{
    public decimal VentasDirectasEfectivo { get; set; }
    public decimal CobranzasCuentasCorrientes { get; set; }
    public decimal CobranzasOtrosMetodos { get; set; }
    public decimal TotalCajaHoy => VentasDirectasEfectivo + CobranzasCuentasCorrientes + CobranzasOtrosMetodos;
}
