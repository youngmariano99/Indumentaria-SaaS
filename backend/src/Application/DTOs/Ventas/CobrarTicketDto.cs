namespace Application.DTOs.Ventas;

public class CobrarTicketDto
{
    public Guid MetodoPagoId { get; set; }
    public decimal MontoTotalDeclarado { get; set; }
    public decimal DescuentoGlobalPct { get; set; } = 0;
    public decimal RecargoGlobalPct { get; set; } = 0;
    
    public string? Notas { get; set; }
    
    public List<CobrarTicketDetalleDto> Detalles { get; set; } = new();
}

public class CobrarTicketDetalleDto
{
    public Guid VarianteProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitarioDeclarado { get; set; }
}
