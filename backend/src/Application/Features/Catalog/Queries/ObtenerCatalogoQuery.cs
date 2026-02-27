using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Queries;

public class ObtenerCatalogoQuery : IRequest<List<ProductoConVariantesDto>> { }

public class ObtenerCatalogoQueryHandler : IRequestHandler<ObtenerCatalogoQuery, List<ProductoConVariantesDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public ObtenerCatalogoQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ProductoConVariantesDto>> Handle(ObtenerCatalogoQuery request, CancellationToken cancellationToken)
    {
        // El global query filter del DbContext ya filtra por TenantId automáticamente.
        var productos = await _dbContext.Productos
            .OrderBy(p => p.Nombre)
            .ToListAsync(cancellationToken);

        var productIds = productos.Select(p => p.Id).ToList();

        var variantes = await _dbContext.VariantesProducto
            .Where(v => productIds.Contains(v.ProductId))
            .ToListAsync(cancellationToken);

        var varianteIds = variantes.Select(v => v.Id).ToList();

        // Traer el stock actual de Inventario (StoreId = Guid.Empty = sucursal global)
        var inventarios = await _dbContext.Inventarios
            .Where(i => varianteIds.Contains(i.ProductVariantId))
            .ToListAsync(cancellationToken);

        // Diccionario varianteId → stockActual para búsqueda O(1)
        var stockPorVariante = inventarios
            .GroupBy(i => i.ProductVariantId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.StockActual));

        // Diccionario productoId → variantes (evita N+1)
        var variantesPorProducto = variantes
            .GroupBy(v => v.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return productos.Select(p => new ProductoConVariantesDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Descripcion = p.Descripcion,
            PrecioBase = p.PrecioBase,
            Temporada = p.Temporada,
            TipoProducto = p.TipoProducto,
            Variantes = variantesPorProducto.TryGetValue(p.Id, out var vars)
                ? vars.Select(v => new VarianteResumenDto
                {
                    Id = v.Id,
                    Talle = v.Talle,
                    Color = v.Color,
                    SKU = v.SKU,
                    PrecioCosto = v.PrecioCosto,
                    PrecioOverride = v.PrecioOverride,
                    StockActual = stockPorVariante.TryGetValue(v.Id, out var stock) ? stock : 0
                }).ToList()
                : new List<VarianteResumenDto>()
        }).ToList();
    }
}
