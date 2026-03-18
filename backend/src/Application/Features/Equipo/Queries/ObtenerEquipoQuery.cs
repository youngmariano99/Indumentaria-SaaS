using Application.Common.Interfaces;
using Application.DTOs.Equipo;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Equipo.Queries;

/// <summary>
/// Propósito: Obtener la lista de colaboradores asociados al negocio actual.
/// Lógica: Filtra por TenantId (vía Global Query Filter) y mapea a DTO, incluyendo permisos.
/// </summary>
public record ObtenerEquipoQuery : IRequest<List<ColaboradorDto>>;

public class ObtenerEquipoHandler : IRequestHandler<ObtenerEquipoQuery, List<ColaboradorDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerEquipoHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ColaboradorDto>> Handle(ObtenerEquipoQuery request, CancellationToken cancellationToken)
    {
        var usuarios = await _context.Usuarios
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return usuarios.Select(u => new ColaboradorDto
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Email = u.Email,
            Rol = u.Rol,
            TienePin = !string.IsNullOrEmpty(u.PinCodeHash),
            Permisos = DeserializarPermisos(u.FeaturesJson)
        }).ToList();
    }

    private Dictionary<string, bool> DeserializarPermisos(string json)
    {
        if (string.IsNullOrEmpty(json) || json == "{}") return new Dictionary<string, bool>();
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, bool>>(json) ?? new Dictionary<string, bool>();
        }
        catch
        {
            return new Dictionary<string, bool>();
        }
    }
}
