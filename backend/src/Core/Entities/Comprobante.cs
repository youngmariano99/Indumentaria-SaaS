using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class Comprobante : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }
    public TipoComprobante Tipo { get; set; }
    public EstadoComprobante Estado { get; set; }
    public string? CAE { get; set; }
    public DateTime? VencimientoCAE { get; set; }
    public decimal TotalNeto { get; set; }
    public decimal TotalIva { get; set; }
    public decimal Total { get; set; }
}
