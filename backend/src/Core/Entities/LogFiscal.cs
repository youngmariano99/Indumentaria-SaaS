using System;
using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class LogFiscal : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid InvoiceId { get; set; }
    
    public AccionFiscal Accion { get; set; }
    
    public string? RequestJson { get; set; } // JSONB
    public string? ResponseJson { get; set; } // JSONB
    
    public bool Exitoso { get; set; }
    public DateTime Timestamp { get; set; }
}
