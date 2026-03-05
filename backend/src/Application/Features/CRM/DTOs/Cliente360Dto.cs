namespace Application.Features.CRM.DTOs;

public class Cliente360Dto : ClienteDto
{
    public decimal TotalGastadoHistorico { get; set; }
    public int CantidadComprasHistoricas { get; set; }
    public DateTime? FechaUltimaCompra { get; set; }
    public decimal TicketPromedio { get; set; }
    
    public List<TransaccionHistoricoDto> HistorialTransacciones { get; set; } = new();
    public List<PrendaEnCursoDto> PrendasEnCurso { get; set; } = new();
}

public class TransaccionHistoricoDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Tipo { get; set; } = string.Empty; // "Venta", "Ajuste a Favor", "Deuda"
    public decimal MontoTotal { get; set; }
    public string Descripcion { get; set; } = string.Empty; // Ej: "TCK-2026...", "Ajuste manual", "Devolución"
    
    // Solo si aplica (cuando Tipo == "Venta")
    public List<CompraRecienteDetalleDto>? Detalles { get; set; }

    // Solo si aplica (cuando Tipo == "Ingreso de Saldo" y está asociado a una deuda específica)
    public Guid? DeudaOrigenId { get; set; }
}

public class CompraRecienteDetalleDto
{
    public Guid VarianteProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string VarianteNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public bool PosibleDevolucion { get; set; }
}

public class PrendaEnCursoDto
{
    public Guid Id { get; set; }
    public Guid VarianteProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string VarianteNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioReferencia { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
