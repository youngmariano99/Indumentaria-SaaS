using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class Inventario : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }
    public Guid VarianteProductoId { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
}
