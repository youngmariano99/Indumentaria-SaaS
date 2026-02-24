using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public class LogAuditoria : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string NombreTabla { get; set; } = string.Empty;
    public string ClavePrimaria { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string ValoresAntiguosJson { get; set; } = string.Empty;
    public string ValoresNuevosJson { get; set; } = string.Empty;
    public string DireccionIp { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
}
