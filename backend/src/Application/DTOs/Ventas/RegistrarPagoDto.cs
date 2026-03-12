namespace Application.DTOs.Ventas;

public class RegistrarPagoDto
{
    public Guid ClienteId { get; set; }
    public decimal Monto { get; set; }
    public Guid MetodoPagoId { get; set; }
    public string? Notas { get; set; }
}
