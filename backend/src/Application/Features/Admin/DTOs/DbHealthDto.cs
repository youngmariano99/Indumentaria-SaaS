namespace Application.Features.Admin.DTOs;

public class DbHealthDto
{
    public int ActiveConnections { get; set; }
    public int MaxConnections { get; set; }
    public long DatabaseSizeBytes { get; set; }
    public double SystemCpuUsagePercentage { get; set; }
    public DateTime ServerTimeUtc { get; set; } = DateTime.UtcNow;

    // Métricas por base de datos (generalmente la pública del SaaS)
    public long TotalTransactionsCommited { get; set; }
    public long TotalTransactionsRolledBack { get; set; }
    public double CacheHitRatio { get; set; }
    public long TupleFetches { get; set; }
}
