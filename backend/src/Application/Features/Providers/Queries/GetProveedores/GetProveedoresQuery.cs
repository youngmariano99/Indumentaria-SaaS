using Application.Common.Interfaces;
using Application.Features.Providers.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Providers.Queries.GetProveedores;

public class GetProveedoresQuery : IRequest<List<ProveedorDto>>
{
    public string? Search { get; set; }
}

public class GetProveedoresQueryHandler : IRequestHandler<GetProveedoresQuery, List<ProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProveedoresQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProveedorDto>> Handle(GetProveedoresQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Proveedores.AsNoTracking();

        if (!string.IsNullOrEmpty(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(p => p.RazonSocial.ToLower().Contains(search) || p.Cuit.Contains(search));
        }

        return await query
            .Select(p => new ProveedorDto
            {
                Id = p.Id,
                RazonSocial = p.RazonSocial,
                Documento = p.Cuit,
                Email = p.Email,
                Telefono = p.Telefono,
                Direccion = p.Direccion,
                Saldo = p.Saldo,
                PorcentajeRecargo = p.PorcentajeRecargo
            })
            .ToListAsync(cancellationToken);
    }
}
