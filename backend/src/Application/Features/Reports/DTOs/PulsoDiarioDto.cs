using System;
using System.Collections.Generic;

namespace Application.Features.Reports.DTOs;

public class PulsoDiarioDto
{
    public decimal TotalVentasHoy { get; set; }
    public int CantidadTicketsHoy { get; set; }
    public decimal TicketPromedioHoy { get; set; }
    
    // Desglose por método de pago para arqueo rápido
    public List<MetodoPagoResumenDto> MetodoPagoResumen { get; set; } = new();
    
    // Productos más vendidos hoy (Top 5)
    public List<RankingProductoDto> ProductosEstrella { get; set; } = new();
    
    // Alerta de Stock Crítico (Resumen)
    public int VariantesBajoStockMinimo { get; set; }
}

public class MetodoPagoResumenDto
{
    public string Nombre { get; set; } = string.Empty;
    public decimal MontoTotal { get; set; }
    public int CantidadOperaciones { get; set; }
}

public class RankingProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public decimal CantidadVendida { get; set; }
    public decimal TotalMonto { get; set; }
}
