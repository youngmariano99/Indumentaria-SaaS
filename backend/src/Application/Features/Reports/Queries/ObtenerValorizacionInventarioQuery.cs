using Application.Common.Interfaces;
using Application.Features.Reports.DTOs;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Reports.Queries;

public class ObtenerValorizacionInventarioQuery : IRequest<List<ValorizacionInventarioDto>> { }

public class ObtenerValorizacionInventarioHandler : IRequestHandler<ObtenerValorizacionInventarioQuery, List<ValorizacionInventarioDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerValorizacionInventarioHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<ValorizacionInventarioDto>> Handle(ObtenerValorizacionInventarioQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? System.Guid.Empty;

        var valorizacion = await _context.Inventarios
            .Include(i => i.VarianteProducto)
                .ThenInclude(v => v.Producto)
                    .ThenInclude(p => p.Categoria)
            .Where(i => i.TenantId == tenantId)
            .GroupBy(i => i.VarianteProducto.Producto.Categoria.Nombre)
            .Select(g => new ValorizacionInventarioDto
            {
                Categoria = g.Key ?? "Sin Categoría",
                ValorTotalCosto = g.Sum(x => x.StockActual * x.VarianteProducto.PrecioCosto),
                CantidadArticulos = g.Sum(x => x.StockActual)
            })
            .ToListAsync(cancellationToken);

        return valorizacion;
    }
}
