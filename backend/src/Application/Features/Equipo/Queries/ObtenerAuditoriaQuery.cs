using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Equipo.Queries;

public class LogAuditoriaDto
{
    public Guid Id { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? PrimaryKey { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; }
}

public record ObtenerAuditoriaQuery : IRequest<List<LogAuditoriaDto>>;

public class ObtenerAuditoriaHandler : IRequestHandler<ObtenerAuditoriaQuery, List<LogAuditoriaDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerAuditoriaHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LogAuditoriaDto>> Handle(ObtenerAuditoriaQuery request, CancellationToken cancellationToken)
    {
        var logs = await _context.LogsAuditoria
            .OrderByDescending(l => l.Timestamp)
            .Take(100)
            .ToListAsync(cancellationToken);

        // Obtenemos nombres de usuarios para el mapping
        var userIds = logs.Select(l => l.UserId).Distinct().ToList();
        var usuarios = await _context.Usuarios
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Nombre, cancellationToken);

        return logs.Select(l => new LogAuditoriaDto
        {
            Id = l.Id,
            UsuarioNombre = usuarios.TryGetValue(l.UserId, out var nombre) ? nombre : "Sistema/Desconocido",
            TableName = l.TableName,
            Action = l.Action,
            PrimaryKey = l.PrimaryKey,
            OldValues = l.OldValues,
            NewValues = l.NewValues,
            Timestamp = l.Timestamp
        }).ToList();
    }
}
