using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Core.Entities;
using Core.Interfaces;

namespace Application.Features.Ventas.Queries;

/// <summary>
/// Query de búsqueda difusa de alta velocidad para el POS.
/// Busca por Nombre, SKU y EAN13, filtrando por TenantId.
/// </summary>
public record BuscarProductosPosQuery(string Termino) : IRequest<List<ProductoLayerPosDto>>;

public class BuscarProductosPosQueryHandler : IRequestHandler<BuscarProductosPosQuery, List<ProductoLayerPosDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public BuscarProductosPosQueryHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<ProductoLayerPosDto>> Handle(BuscarProductosPosQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException();
        var termino = (request.Termino ?? string.Empty).ToLower().Trim();

        if (string.IsNullOrWhiteSpace(termino))
            return new List<ProductoLayerPosDto>();

        // Optimizamos la búsqueda: 
        // 1. Buscamos productos que coincidan por nombre o EAN
        // 2. Buscamos variantes que coincidan por SKU
        // 3. Consolidamos resultados
        
        var queryProductos = _context.Productos
            .Where(p => p.TenantId == tenantId && !p.IsDeleted)
            .Where(p => p.Nombre.ToLower().Contains(termino) || p.Ean13.Contains(termino));

        var productosIdsPorVariante = await _context.VariantesProducto
            .Where(v => v.TenantId == tenantId && !v.IsDeleted && v.SKU.ToLower().Contains(termino))
            .Select(v => v.ProductId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var productosDocs = await queryProductos
            .Select(p => p.Id)
            .Union(_context.Productos.Where(p => productosIdsPorVariante.Contains(p.Id)).Select(p => p.Id))
            .ToListAsync(cancellationToken);

        // Una vez tenemos los IDs, traemos la info completa (pueden ser muchos, limitamos a 20 para el POS)
        var topIds = productosDocs.Take(20).ToList();

        var productosInfo = await _context.Productos
            .Where(p => topIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Nombre, p.PrecioBase, p.Ean13, p.EsFraccionable })
            .ToListAsync(cancellationToken);

        var variantes = await _context.VariantesProducto
            .Where(v => topIds.Contains(v.ProductId) && !v.IsDeleted)
            .Select(v => new { v.Id, v.ProductId, v.Talle, v.Color, v.SKU })
            .ToListAsync(cancellationToken);

        var varianteIds = variantes.Select(v => v.Id).ToList();
        var stockPorVariante = await _context.Inventarios
            .Where(i => varianteIds.Contains(i.ProductVariantId))
            .GroupBy(i => i.ProductVariantId)
            .Select(g => new { g.Key, Total = g.Sum(i => i.StockActual) })
            .ToDictionaryAsync(x => x.Key, x => x.Total, cancellationToken);

        var variantesPorProducto = variantes
            .GroupBy(v => v.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return productosInfo.Select(p => new ProductoLayerPosDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            PrecioBase = p.PrecioBase,
            Ean13 = p.Ean13 ?? string.Empty,
            EsFraccionable = p.EsFraccionable,
            Variantes = variantesPorProducto.TryGetValue(p.Id, out var vars)
                ? vars.Select(v => new VarianteLayerPosDto
                {
                    VarianteId = v.Id,
                    SizeColor = v.Talle + " / " + v.Color,
                    Talle = v.Talle,
                    Color = v.Color,
                    Sku = v.SKU ?? string.Empty,
                    StockActual = stockPorVariante.TryGetValue(v.Id, out var stock) ? stock : 0
                }).ToList()
                : new List<VarianteLayerPosDto>()
        }).ToList();
    }
}
