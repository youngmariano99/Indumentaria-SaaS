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

    [AllowAnonymous]
    [HttpPost("seed-superadmin")]
    public async Task<IActionResult> SeedSuperAdmin(CancellationToken cancellationToken)
    {
        // 1. Crear Inquilino "master-saas" si no existe
        var masterTenant = await _context.Inquilinos.FirstOrDefaultAsync(t => t.Subdominio == "master-saas", cancellationToken);
        if (masterTenant == null)
        {
            masterTenant = new Core.Entities.Inquilino
            {
                Id = Guid.NewGuid(),
                NombreComercial = "Master SaaS",
                CUIT = "00000000000",
                Subdominio = "master-saas",
                ConfiguracionRegional = "es-AR",
                FechaCreacion = DateTime.UtcNow
            };
            _context.Inquilinos.Add(masterTenant);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 2. Crear SuperAdmin si no existe
        var superAdmin = await _context.Usuarios.IgnoreQueryFilters()
                                .FirstOrDefaultAsync(u => u.Email == "appystudios@gmail.com", cancellationToken);
        
        if (superAdmin == null)
        {
            superAdmin = new Core.Entities.Usuario
            {
                Id = Guid.NewGuid(),
                TenantId = masterTenant.Id,
                Nombre = "Super Admin Appy",
                Email = "appystudios@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin1234"),
                Rol = Core.Enums.SystemRole.SuperAdmin
            };
            _context.Usuarios.Add(superAdmin);
            await _context.SaveChangesAsync(cancellationToken);
            
            return Ok(new { message = "SuperAdmin y Tenant creados exitosamente.", email = superAdmin.Email });
        }

        return Ok(new { message = "El SuperAdmin ya existe.", email = superAdmin.Email });
    }

    [HttpGet("pwa-status")]
    public async Task<IActionResult> GetPwaStatusAsync(CancellationToken cancellationToken)
    {
        // Traemos todos los dispositivos almacenados globalmente, ignorando el filtro de Inquilino 
        // ya que estamos en contexto de SuperAdmin (Global Query Filters ya están en bypass).
        var query = await _context.EstadosDispositivosPwa
            .Join(_context.Inquilinos,
                  d => d.TenantId,
                  i => i.Id,
                  (d, i) => new
                  {
                      d.Id,
                      TenantId = i.Id,
                      TenantName = i.NombreComercial,
                      TenantSubdomain = i.Subdominio,
                      d.DispositivoId,
                      d.NombreDispositivo,
                      d.AppVersion,
                      d.UltimaVezOnline,
                      d.ItemsPendientesSubida
                  })
            .OrderByDescending(d => d.ItemsPendientesSubida) // Priorizar los más saturados
            .ThenBy(d => d.UltimaVezOnline)             // Priorizar los más viejos sin conectar
            .ToListAsync(cancellationToken);

        return Ok(query);
    }
}
