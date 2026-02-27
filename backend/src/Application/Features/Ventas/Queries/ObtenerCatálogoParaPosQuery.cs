using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Queries;

public record ProductoLayerPosDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    
    // Lista compactada
    public List<VarianteLayerPosDto> Variantes { get; set; } = new();
}

public record VarianteLayerPosDto
{
    public Guid VarianteId { get; set; }
    public string SizeColor { get; set; } = string.Empty;
    public int CoeficienteStock { get; set; }
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
        // Se carga todo el catálogo habilitado para venta y se mapea a un DTO comprimido
        var productos = await _context.Productos
            // NO se incluye Descripcion profunda para ahorrar payload
            .Select(p => new ProductoLayerPosDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                PrecioBase = p.PrecioBase,
                Variantes = _context.VariantesProducto
                    .Where(v => v.ProductId == p.Id)
                    .Select(v => new VarianteLayerPosDto
                    {
                        VarianteId = v.Id,
                        SizeColor = v.Talle + " / " + v.Color,
                        CoeficienteStock = 0 // El stock está en la tabla Inventarios, requiere un Include a futuro, devolvemos 0 por ahora
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        return productos;
    }
}
