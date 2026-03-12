using System;

namespace Application.Features.Reports.DTOs;

public class BajoStockDto
{
    public Guid VarianteId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string VarianteNombre { get; set; } = string.Empty; // Color/Talle para indumentaria, Medida para ferretería
    public string Categoria { get; set; } = string.Empty;
    public decimal StockActual { get; set; }
    public decimal StockMinimo { get; set; }
    public string? Proveedor { get; set; } // Opcional por ahora
}

public class ValorizacionInventarioDto
{
    public string Categoria { get; set; } = string.Empty;
    public decimal ValorTotalCosto { get; set; }
    public decimal CantidadArticulos { get; set; }
}
