using Application.Common.Interfaces;
using Application.Features.CRM.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Queries;

public class ObtenerClientesQuery : IRequest<List<ClienteDto>>
{
}

public class ObtenerClientesQueryHandler : IRequestHandler<ObtenerClientesQuery, List<ClienteDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerClientesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClienteDto>> Handle(ObtenerClientesQuery request, CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Nombre)
            .Select(c => new ClienteDto
            {
                Id = c.Id,
                Documento = c.Documento,
                Nombre = c.Nombre,
                Email = c.Email,
                Telefono = c.Telefono,
                Direccion = c.Direccion,
                CondicionIva = c.CondicionIva,
                PreferenciasJson = c.PreferenciasJson
            })
            .ToListAsync(cancellationToken);

        return clientes;
    }
}
