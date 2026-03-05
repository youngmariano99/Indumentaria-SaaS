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
}
