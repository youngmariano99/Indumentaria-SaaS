using Core.Entities.Base;

namespace Core.Entities;

public class ItemComprobante : BaseEntity
{
    public Guid ComprobanteId { get; set; }
    public Guid VarianteProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal IvaAlicuota { get; set; }
}
