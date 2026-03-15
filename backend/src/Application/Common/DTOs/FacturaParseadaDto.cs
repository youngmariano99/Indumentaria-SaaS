using System;
using System.Collections.Generic;

namespace Application.Common.DTOs;

public class FacturaParseadaDto
{
    public string? NumeroFactura { get; set; }
    public DateTime? FechaEmision { get; set; }
    public decimal? MontoTotal { get; set; }
    public string? CuitProveedor { get; set; }
    public string? RazonSocialProveedor { get; set; }
    public List<ItemFacturaParseadoDto> Items { get; set; } = new();
    public string RawJson { get; set; } = "{}";
    public double ConfidenceScore { get; set; }
}

public class ItemFacturaParseadoDto
{
    public string? Descripcion { get; set; }
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Total { get; set; }
    public string? Sku { get; set; }
}
