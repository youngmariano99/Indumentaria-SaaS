using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class TransaccionBilletera : BaseEntity
{
    public Guid BilleteraVirtualId { get; set; }
    public decimal Monto { get; set; }
    public TipoTransaccionWallet Tipo { get; set; }
    public Guid? ComprobanteId { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
}
