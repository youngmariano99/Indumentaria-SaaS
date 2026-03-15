using Application.Common.Interfaces;
using Application.DTOs.Equipo;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Equipo.Commands;

/// <summary>
/// Propósito: Modificar los permisos (Features) de un colaborador específico.
/// Lógica: Busca al usuario en el tenant y sobreescribe su FeaturesJson.
/// </summary>
public record ActualizarPermisosColaboradorCommand : IRequest<Unit>
{
    public Guid UsuarioId { get; init; }
    public Dictionary<string, bool> Permisos { get; init; } = new();
}

public class ActualizarPermisosColaboradorHandler : IRequestHandler<ActualizarPermisosColaboradorCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public ActualizarPermisosColaboradorHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(ActualizarPermisosColaboradorCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken);

        if (usuario == null) throw new Exception("Colaborador no encontrado.");
        if (usuario.Rol == Core.Enums.SystemRole.Owner) throw new Exception("No se pueden restringir permisos al dueño del negocio.");

        usuario.FeaturesJson = JsonSerializer.Serialize(request.Permisos);
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;
    }
}
