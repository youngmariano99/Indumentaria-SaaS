using Application.Features.Admin.DTOs;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/admin/audit")]
[Authorize(Roles = "SuperAdmin")] // Protección estricta: Solo Personal Interno
public class AdminAuditController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminAuditController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Búsqueda global de auditoría (Sin filtro de Tenant) usando ILike en PostgreSQL
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<LogAuditoriaDto>>> SearchAudit(
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? tenantId,
        [FromQuery] string? tableName,
        [FromQuery] Guid? userId,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0)
    {
        // 1. Ignoramos filtros globales (Global Query Filter) para poder ver la data de todos los inquilinos
        var query = _context.LogsAuditoria.IgnoreQueryFilters().AsNoTracking();

        // 2. Filtros estrictos
        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            query = query.Where(l => l.TenantId == tenantId.Value);

        if (userId.HasValue && userId.Value != Guid.Empty)
            query = query.Where(l => l.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(tableName))
            query = query.Where(l => l.TableName == tableName);

        // 3. Búsqueda profunda (ILike simula case-insensitive)
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = $"%{searchTerm}%";
            query = query.Where(l =>
                EF.Functions.ILike(l.PrimaryKey ?? "", term) ||
                EF.Functions.ILike(l.OldValues ?? "", term) ||
                EF.Functions.ILike(l.NewValues ?? "", term) ||
                EF.Functions.ILike(l.Action, term)
            );
        }

        // 4. Orden cronológico descendente
        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip(offset)
            .Take(limit)
            .Select(l => new LogAuditoriaDto
            {
                Id = l.Id,
                TenantId = l.TenantId,
                UserId = l.UserId,
                TableName = l.TableName,
                PrimaryKey = l.PrimaryKey,
                Action = l.Action,
                OldValues = l.OldValues,
                NewValues = l.NewValues,
                IpAddress = l.IpAddress,
                Timestamp = l.Timestamp
            })
            .ToListAsync();

        return Ok(logs);
    }

    /// <summary>
    /// Transaction Debugger: Reconstruye la cronología de vida de una Primary Key
    /// </summary>
    [HttpGet("timeline/{entityId}")]
    public async Task<ActionResult<List<LogAuditoriaDto>>> GetEntityTimeline(string entityId)
    {
        // Ignorar filtros por si la entidad la creó otro tenant o es un fallo multitenant
        var logs = await _context.LogsAuditoria.IgnoreQueryFilters().AsNoTracking()
            .Where(l => l.PrimaryKey == entityId)
            .OrderBy(l => l.Timestamp) // Ascendente: Desde que nació hasta que murió
            .Select(l => new LogAuditoriaDto
            {
                Id = l.Id,
                TenantId = l.TenantId,
                UserId = l.UserId,
                TableName = l.TableName,
                PrimaryKey = l.PrimaryKey,
                Action = l.Action,
                OldValues = l.OldValues,
                NewValues = l.NewValues,
                IpAddress = l.IpAddress,
                Timestamp = l.Timestamp
            })
            .ToListAsync();

        return Ok(logs);
    }

    /// <summary>
    /// Escáner Heurístico de Detección de Fraude y Anomalías (Reglas SRE)
    /// </summary>
    [HttpGet("alerts")]
    public async Task<ActionResult<List<AlertDto>>> GetFraudAlerts()
    {
        var alerts = new List<AlertDto>();
        var umbralTiempo = DateTime.UtcNow.AddDays(-2); // Analizamos las últimas 48 horas intensivas

        // 1. REGLA A: Ráfagas de eliminaciones (Devoluciones simuladas o borrar ventas/productos directos)
        var deleteBursts = await _context.LogsAuditoria
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(l => l.Timestamp >= umbralTiempo && l.Action == "DELETE")
            .GroupBy(l => new { l.TenantId, l.UserId, l.TableName })
            .Select(g => new { 
                g.Key.TenantId, 
                g.Key.UserId, 
                g.Key.TableName, 
                Count = g.Count(), 
                LastEvent = g.Max(x => x.Timestamp) 
            })
            .Where(g => g.Count >= 3) // Umbral agresivo: Más de 3 eliminaciones de un tiron
            .ToListAsync();

        foreach (var burst in deleteBursts)
        {
            var tenant = await _context.Inquilinos.FindAsync(burst.TenantId);
            alerts.Add(new AlertDto
            {
                TenantId = burst.TenantId,
                TenantName = tenant?.NombreComercial ?? "Inquilino Variante",
                NivelRiesgo = burst.Count > 10 ? "Crítico" : "Alto",
                TipoFraude = "Ráfaga de Eliminaciones",
                Detalles = $"Se detectaron {burst.Count} eliminaciones en la tabla '{burst.TableName}'.",
                UsuarioSospechoso = burst.UserId.ToString(),
                Timestamp = burst.LastEvent
            });
        }

        // 2. REGLA B: Movimientos nocturnos de dinero o inventario (Operaciones sensibles 1 AM y 6 AM UTC)
        var nightMoves = await _context.LogsAuditoria
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(l => l.Timestamp >= umbralTiempo && 
                      (l.TableName == "ArqueosCaja" || l.TableName == "MovimientosSaldosClientes" || l.TableName == "Inventarios"))
            .ToListAsync();
            
        // El filtro de hora en memoria para evadir problemas de timezones en EF
        var suspiciousNightMoves = nightMoves.Where(l => l.Timestamp.Hour >= 1 && l.Timestamp.Hour <= 5).ToList();

        foreach (var move in suspiciousNightMoves)
        {
            var tenant = await _context.Inquilinos.FindAsync(move.TenantId);
            alerts.Add(new AlertDto
            {
                TenantId = move.TenantId,
                TenantName = tenant?.NombreComercial ?? "Inquilino Variante",
                NivelRiesgo = move.TableName == "ArqueosCaja" ? "Alto" : "Medio",
                TipoFraude = "Operación Nocturna Furtiva",
                Detalles = $"Acción {move.Action} en sub-módulo '{move.TableName}'.",
                UsuarioSospechoso = move.UserId.ToString(),
                Timestamp = move.Timestamp
            });
        }

        return Ok(alerts.OrderByDescending(a => a.Timestamp).ToList());
    }
}

public class AlertDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string NivelRiesgo { get; set; } = string.Empty; 
    public string TipoFraude { get; set; } = string.Empty;
    public string Detalles { get; set; } = string.Empty;
    public string UsuarioSospechoso { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
