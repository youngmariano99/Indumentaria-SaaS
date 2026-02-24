using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class LogFiscal : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid ComprobanteId { get; set; }
    public AccionFiscal Accion { get; set; }
    public string RequestJson { get; set; } = string.Empty;
    public string ResponseJson { get; set; } = string.Empty;
    public bool FueExitoso { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
}
