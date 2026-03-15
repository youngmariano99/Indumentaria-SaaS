using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Catalog.Queries;

public class ProductAutocompleteDto
{
    public Guid VarianteId { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string SKU { get; set; } = null!;
    public decimal PrecioCostoActual { get; set; }
}

public class GetProductAutocompleteQuery : IRequest<List<ProductAutocompleteDto>>
{
    public string Search { get; set; } = string.Empty;
}

public class GetProductAutocompleteQueryHandler : IRequestHandler<GetProductAutocompleteQuery, List<ProductAutocompleteDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductAutocompleteQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductAutocompleteDto>> Handle(GetProductAutocompleteQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Search)) return new List<ProductAutocompleteDto>();

        var search = request.Search.ToLower();

        return await _context.VariantesProducto
            .AsNoTracking()
            .Include(v => v.Producto)
            .Where(v => v.Producto.Nombre.ToLower().Contains(search) || v.SKU.ToLower().Contains(search))
            .Take(10)
            .Select(v => new ProductAutocompleteDto
            {
                VarianteId = v.Id,
                NombreCompleto = $"{v.Producto.Nombre} ({v.Talle} - {v.Color})",
                SKU = v.SKU,
                PrecioCostoActual = v.PrecioCosto
            })
            .ToListAsync(cancellationToken);
    }
}
