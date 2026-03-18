using Application.Common.Interfaces;
using Application.DTOs.Sucursales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Sucursales.Queries;

public record ObtenerSucursalesQuery : IRequest<List<SucursalDto>>;

public class ObtenerSucursalesHandler : IRequestHandler<ObtenerSucursalesQuery, List<SucursalDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerSucursalesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SucursalDto>> Handle(ObtenerSucursalesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Sucursales
            .AsNoTracking()
            .Select(s => new SucursalDto
            {
                Id = s.Id,
                Nombre = s.Nombre,
                Direccion = s.Direccion,
                Telefono = s.Telefono,
                EsDepositoCentral = s.EsDepositoCentral
            })
            .ToListAsync(cancellationToken);
    }
}
