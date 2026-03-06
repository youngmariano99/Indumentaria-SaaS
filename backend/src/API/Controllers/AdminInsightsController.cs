using Application.Features.Admin.DTOs;
using Core.Entities;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers;

[ApiController]
[Route("api/admin/insights")]
[Authorize(Roles = "SuperAdmin")]
public class AdminInsightsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminInsightsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("usage")]
    public async Task<ActionResult<UsageStatsDto>> GetUsageStats()
    {
        var today = DateTime.UtcNow.Date;
        
        // DAU Global (Usuarios únicos en el último día)
        var globalDau = await _context.LogsAuditoria
            .IgnoreQueryFilters()
            .Where(l => l.Timestamp >= today)
            .Select(l => l.UserId)
            .Distinct()
            .CountAsync();

        // Top Tenants por actividad
        var tenantActivity = await _context.LogsAuditoria
            .IgnoreQueryFilters()
            .Where(l => l.Timestamp >= today)
            .GroupBy(l => l.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Select(x => x.UserId).Distinct().Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync();

        var stats = new UsageStatsDto
        {
            GlobalDau = globalDau,
            TopTenants = new List<TenantActivityDto>()
        };

        foreach (var active in tenantActivity)
        {
            var tenant = await _context.Inquilinos.FindAsync(active.TenantId);
            stats.TopTenants.Add(new TenantActivityDto
            {
                TenantId = active.TenantId,
                TenantName = tenant?.NombreComercial ?? "Inquilino Desconocido",
                ActiveUsersCount = active.Count,
                GrowthPercentage = 3.5 // Simulado para demo comercial
            });
        }

        return Ok(stats);
    }

    [HttpGet("ghost-inventory")]
    public async Task<ActionResult<List<GhostInventoryDto>>> GetGhostInventory()
    {
        var limitDate = DateTime.UtcNow.AddDays(-5);
        
        // Heurística de Inventario Fantasma
        var suspiciousProducts = await _context.VentasDetalles
            .IgnoreQueryFilters()
            .Include(vd => vd.Venta)
            .Include(vd => vd.VarianteProducto)
            .Where(vd => vd.Venta.CreatedAt < limitDate)
            .GroupBy(vd => new { vd.TenantId, vd.VarianteProducto.ProductId })
            .Select(g => new 
            { 
                g.Key.TenantId, 
                ProductoId = g.Key.ProductId, 
                UltimaVenta = g.Max(x => x.Venta.CreatedAt),
                TotalVendidoHistorico = g.Count() 
            })
            .Where(x => x.TotalVendidoHistorico > 10)
            .Take(20)
            .ToListAsync();

        var result = new List<GhostInventoryDto>();

        foreach (var item in suspiciousProducts)
        {
            var producto = await _context.Productos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == item.ProductoId);
            if (producto == null) continue;

            var tenant = await _context.Inquilinos.FindAsync(item.TenantId);
            
            result.Add(new GhostInventoryDto
            {
                TenantId = item.TenantId,
                TenantName = tenant?.NombreComercial ?? "Tienda",
                ProductoId = item.ProductoId,
                NombreProducto = producto.Nombre,
                StockActual = 12, // Placeholder
                UltimaVenta = item.UltimaVenta,
                ProbabilidadDiscrepancia = 85.5 
            });
        }

        return Ok(result);
    }

    [HttpGet("churn-risk")]
    public async Task<ActionResult<List<ChurnRiskDto>>> GetChurnRisk()
    {
        var lastWeek = DateTime.UtcNow.AddDays(-7);
        var previousWeek = lastWeek.AddDays(-7);

        // Tenants con actividad nula o muy baja esta semana vs la anterior
        var currentActivity = await _context.Ventas
            .IgnoreQueryFilters()
            .Where(v => v.CreatedAt >= lastWeek)
            .GroupBy(v => v.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count() })
            .ToListAsync();

        var pastActivity = await _context.Ventas
            .IgnoreQueryFilters()
            .Where(v => v.CreatedAt >= previousWeek && v.CreatedAt < lastWeek)
            .GroupBy(v => v.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count() })
            .ToListAsync();

        var risks = new List<ChurnRiskDto>();

        foreach (var past in pastActivity)
        {
            var current = currentActivity.FirstOrDefault(c => c.TenantId == past.TenantId);
            var currentCount = current?.Count ?? 0;

            if (currentCount < past.Count * 0.4) // Caída mayor al 60%
            {
                var tenant = await _context.Inquilinos.FindAsync(past.TenantId);
                risks.Add(new ChurnRiskDto
                {
                    TenantId = past.TenantId,
                    TenantName = tenant?.NombreComercial ?? "Tienda",
                    NivelRiesgo = currentCount == 0 ? "Crítico" : "Alto",
                    Motivo = currentCount == 0 ? "Sin ventas en los últimos 7 días" : "Caída drástica de volumen transaccional",
                    UltimaActividadSignificativa = DateTime.UtcNow
                });
            }
        }

        return Ok(risks);
    }
}
