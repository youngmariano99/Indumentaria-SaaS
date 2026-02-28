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
}
