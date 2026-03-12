using Application.Common.Interfaces;
using Application.DTOs.Ajustes;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Queries;

public class ObtenerAtributosConfiguracionQuery : IRequest<List<AtributoConfiguracionDto>>
{
    public string? Grupo { get; set; }
}

public class ObtenerAtributosConfiguracionQueryHandler : IRequestHandler<ObtenerAtributosConfiguracionQuery, List<AtributoConfiguracionDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerAtributosConfiguracionQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AtributoConfiguracionDto>> Handle(ObtenerAtributosConfiguracionQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AtributosConfiguracion.AsQueryable();

        if (!string.IsNullOrEmpty(request.Grupo))
        {
            query = query.Where(a => a.Grupo == request.Grupo);
        }

        var result = await query
            .OrderBy(a => a.Grupo)
            .ThenBy(a => a.Orden)
            .Select(a => new AtributoConfiguracionDto
            {
                Id = a.Id,
                Grupo = a.Grupo,
                Valor = a.Valor,
                Orden = a.Orden
            })
            .ToListAsync(cancellationToken);

        return result;
    }
}
