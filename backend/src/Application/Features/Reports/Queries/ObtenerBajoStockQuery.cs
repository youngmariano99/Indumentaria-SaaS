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

public class ObtenerBajoStockQuery : IRequest<List<BajoStockDto>> { }

public class ObtenerBajoStockHandler : IRequestHandler<ObtenerBajoStockQuery, List<BajoStockDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerBajoStockHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<BajoStockDto>> Handle(ObtenerBajoStockQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? System.Guid.Empty;

        var bajoStock = await _context.Inventarios
            .Include(i => i.VarianteProducto)
                .ThenInclude(v => v.Producto)
                    .ThenInclude(p => p.Categoria)
            .Where(i => i.TenantId == tenantId && i.StockActual <= i.StockMinimo)
            .Select(i => new BajoStockDto
            {
                VarianteId = i.ProductVariantId,
                ProductoNombre = i.VarianteProducto.Producto.Nombre,
                VarianteNombre = $"{i.VarianteProducto.Talle} / {i.VarianteProducto.Color}",
                Categoria = i.VarianteProducto.Producto.Categoria.Nombre,
                StockActual = i.StockActual,
                StockMinimo = i.StockMinimo
            })
            .ToListAsync(cancellationToken);

        return bajoStock;
    }
}
