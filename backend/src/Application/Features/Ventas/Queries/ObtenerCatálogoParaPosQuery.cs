using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Queries;

public record ProductoLayerPosDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    /// <summary>Código de barras a nivel producto (EAN13).</summary>
    public string Ean13 { get; set; } = string.Empty;
    public List<VarianteLayerPosDto> Variantes { get; set; } = new();
}

public record VarianteLayerPosDto
{
    public Guid VarianteId { get; set; }
    public string SizeColor { get; set; } = string.Empty;
    public string Talle { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    /// <summary>Stock actual (suma de Inventarios por variante).</summary>
    public int StockActual { get; set; }
}

public record ObtenerCatálogoParaPosQuery() : IRequest<List<ProductoLayerPosDto>>;

public class ObtenerCatálogoParaPosQueryHandler : IRequestHandler<ObtenerCatálogoParaPosQuery, List<ProductoLayerPosDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerCatálogoParaPosQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductoLayerPosDto>> Handle(ObtenerCatálogoParaPosQuery request, CancellationToken cancellationToken)
    {
        var productos = await _context.Productos
            .Where(p => !p.IsDeleted)
            .Select(p => new { p.Id, p.Nombre, p.PrecioBase, p.Ean13 })
            .ToListAsync(cancellationToken);

        var productoIds = productos.Select(p => p.Id).ToList();
        var variantes = await _context.VariantesProducto
            .Where(v => productoIds.Contains(v.ProductId) && !v.IsDeleted)
            .Select(v => new { v.Id, v.ProductId, v.Talle, v.Color, v.SKU })
            .ToListAsync(cancellationToken);

        var varianteIds = variantes.Select(v => v.Id).ToList();
        var inventarios = await _context.Inventarios
            .Where(i => varianteIds.Contains(i.ProductVariantId))
            .ToListAsync(cancellationToken);

        var stockPorVariante = inventarios
            .GroupBy(i => i.ProductVariantId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.StockActual));

        var variantesPorProducto = variantes
            .GroupBy(v => v.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return productos.Select(p => new ProductoLayerPosDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            PrecioBase = p.PrecioBase,
            Ean13 = p.Ean13 ?? string.Empty,
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
