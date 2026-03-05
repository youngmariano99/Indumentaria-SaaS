namespace Application.Features.Admin.DTOs;

public class LogAuditoriaDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string? PrimaryKey { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
