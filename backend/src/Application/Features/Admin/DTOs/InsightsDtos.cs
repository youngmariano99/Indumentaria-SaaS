using System;
using System.Collections.Generic;

namespace Application.Features.Admin.DTOs;

public class UsageStatsDto
{
    public int GlobalDau { get; set; }
    public List<TenantActivityDto> TopTenants { get; set; } = new();
}

public class TenantActivityDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public int ActiveUsersCount { get; set; }
    public double GrowthPercentage { get; set; }
}

public class GhostInventoryDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public Guid ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public DateTime UltimaVenta { get; set; }
    public double ProbabilidadDiscrepancia { get; set; } // 0 a 100
}

public class ChurnRiskDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string NivelRiesgo { get; set; } = string.Empty; // Crítico, Alto, Medio
    public string Motivo { get; set; } = string.Empty;
    public DateTime UltimaActividadSignificativa { get; set; }
}
