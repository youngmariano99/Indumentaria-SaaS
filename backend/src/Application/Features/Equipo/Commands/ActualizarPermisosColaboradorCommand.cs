using Application.Common.Interfaces;
using Application.DTOs.Equipo;
using Core.Interfaces;
using Core.Exceptions;
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
    private readonly IFeatureResolver _featureResolver;

    public ActualizarPermisosColaboradorHandler(IApplicationDbContext context, IFeatureResolver featureResolver)
    {
        _context = context;
        _featureResolver = featureResolver;
    }

    public async Task<Unit> Handle(ActualizarPermisosColaboradorCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken);

        if (usuario == null) throw new BusinessException("Colaborador no encontrado.");
        if (usuario.Rol == Core.Enums.SystemRole.Owner) throw new BusinessException("No se pueden restringir permisos al dueño del negocio.");

        usuario.FeaturesJson = JsonSerializer.Serialize(request.Permisos);
        
        await _context.SaveChangesAsync(cancellationToken);

        // Limpiar caché para que los cambios se vean al momento
        _featureResolver.InvalidateCache(usuario.TenantId, usuario.Id);
        
        return Unit.Value;
    }
}
