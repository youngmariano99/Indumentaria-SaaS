using System;

namespace Application.DTOs.Catalog;

/// <summary>
/// Resumen de stock por variante para el módulo de catálogo asistido.
/// </summary>
public class VarianteStockResumenDto
{
    public Guid VarianteId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal StockActual { get; set; }
}

/// <summary>
/// Resumen de stock por producto (incluye sus variantes).
/// </summary>
public class ProductoStockResumenDto
{
    public Guid ProductoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    
    /// <summary>
    /// Stock total agregado de todas las variantes del producto (stock bajo).
    /// En el caso de la consulta de "sin stock", este valor se reutiliza para
    /// indicar la cantidad de variantes sin stock de ese producto.
    /// </summary>
    public decimal StockTotal { get; set; }

    public List<VarianteStockResumenDto> Variantes { get; set; } = new();
}

/// <summary>
/// Resumen de ventas por producto (últimos 7 días) para catálogo asistido.
/// </summary>
public class ProductoVentaSemanaDto
{
    public Guid ProductoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal UnidadesVendidas { get; set; }
    public decimal ImporteTotal { get; set; }
}

