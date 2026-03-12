using Core.Enums;

namespace Application.DTOs.Ventas;

public class DevolucionDto
{
    public Guid ClienteId { get; set; }
    
    // Lo que el cliente DEJA en el local (vuelve al stock, suma a su favor)
    public List<DevolucionDetalleDto> VariantesDevueltas { get; set; } = new();
    
    // Lo que el cliente se LLEVA (resta del stock, resta de su favor)
    public List<DevolucionDetalleDto> VariantesLlevadas { get; set; } = new();
    
    public string? Motivo { get; set; }
}

public class DevolucionDetalleDto
{
    public Guid VarianteProductoId { get; set; }
    public decimal Cantidad { get; set; }
    public DestinoDevolucion Destino { get; set; } = DestinoDevolucion.VentaDirecta;
}
