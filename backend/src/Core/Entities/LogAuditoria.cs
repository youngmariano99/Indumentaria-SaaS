using System;
using Core.Entities.Base;

namespace Core.Entities;

public class LogAuditoria : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    
    public string TableName { get; set; } = string.Empty;
    public string? PrimaryKey { get; set; }
    
    public string Action { get; set; } = string.Empty; // Insert, Update, Delete
    
    public string? OldValues { get; set; } // JSONB
    public string? NewValues { get; set; } // JSONB
    
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
