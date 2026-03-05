using Application.Common.Interfaces;
using Application.Features.Admin.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")] // Protección estricta: Solo el rol SuperAdmin
public class AdminHealthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminHealthController(IApplicationDbContext context)
    {
        _context = context;
        _context.EnterBypassMode(); // Zona libre de Tenants
    }

    [HttpGet("db-stats")]
    public async Task<IActionResult> GetDatabaseHealthStats(CancellationToken cancellationToken)
    {
        var health = new DbHealthDto();
        
        // 1. Conexiones Activas vs Max
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            await _context.Database.OpenConnectionAsync(cancellationToken);
            
            // Conexiones Máximas Configuradas y Activas Totales
            command.CommandText = @"
                SELECT 
                  (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections') as max_conns,
                  (SELECT count(*) FROM pg_stat_activity WHERE state IS NOT NULL) as active_conns,
                  (SELECT pg_database_size(current_database())) as size_bytes
            ";
            
            using (var reader = await command.ExecuteReaderAsync(cancellationToken))
            {
                if (await reader.ReadAsync(cancellationToken))
                {
                    health.MaxConnections = reader.GetInt32(0);
                    health.ActiveConnections = reader.GetInt32(1);
                    health.DatabaseSizeBytes = reader.GetInt64(2);
                }
            }
            
            // 2. Transacciones y Cache Hit Ratio global de la DB actual
            command.CommandText = @"
                SELECT 
                  xact_commit,
                  xact_rollback,
                  tup_fetched,
                  CASE 
                      WHEN blks_hit + blks_read = 0 THEN 0 
                      ELSE (blks_hit::float / (blks_hit + blks_read)) * 100 
                  END as cache_hit_ratio
                FROM pg_stat_database 
                WHERE datname = current_database();
            ";
            
             using (var reader = await command.ExecuteReaderAsync(cancellationToken))
            {
                if (await reader.ReadAsync(cancellationToken))
                {
                    health.TotalTransactionsCommited = reader.GetInt64(0);
                    health.TotalTransactionsRolledBack = reader.GetInt64(1);
                    health.TupleFetches = reader.GetInt64(2);
                    health.CacheHitRatio = Math.Round(reader.GetDouble(3), 2);
                }
            }
            
            // 3. Simulación de CPU (PostgreSQL en PaaS restringe la CPU bruta, enviamos load simulated o aleatorio para demostración front)
            // En un caso real se usa AWS CloudWatch o Neon API.
            health.SystemCpuUsagePercentage = Math.Round(new Random().NextDouble() * 15 + health.ActiveConnections * 1.5, 2); 
            if(health.SystemCpuUsagePercentage > 100) health.SystemCpuUsagePercentage = 100;
        }

        return Ok(health);
    }
}
