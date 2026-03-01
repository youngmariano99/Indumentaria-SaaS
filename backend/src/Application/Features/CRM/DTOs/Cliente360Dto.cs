namespace Application.Features.CRM.DTOs;

public class Cliente360Dto : ClienteDto
{
    public decimal TotalGastadoHistorico { get; set; }
    public int CantidadComprasHistoricas { get; set; }
    public DateTime? FechaUltimaCompra { get; set; }
    public decimal TicketPromedio { get; set; }
    
    public List<CompraRecienteDto> ComprasRecientes { get; set; } = new();
}

public class CompraRecienteDto
{
    public Guid VentaId { get; set; }
    public DateTime Fecha { get; set; }
    public decimal MontoTotal { get; set; }
    public string IdentificadorTicket { get; set; } = string.Empty;
    
    public List<CompraRecienteDetalleDto> Detalles { get; set; } = new();
}

public class CompraRecienteDetalleDto
{
    public Guid VarianteProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string VarianteNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
}
