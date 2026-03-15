using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Providers.Commands.RecordFacturaProveedor;

public class UpdateCostosProveedorCommand : IRequest<bool>
{
    public Guid ProveedorId { get; set; }
    public decimal PorcentajeAumento { get; set; }
}

public class UpdateCostosProveedorCommandHandler : IRequestHandler<UpdateCostosProveedorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateCostosProveedorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCostosProveedorCommand request, CancellationToken cancellationToken)
    {
        // 1. Obtener variantes vinculadas a este proveedor mediante ProveedorProducto
        var productosIds = await _context.ProveedoresProductos
            .Where(pp => pp.ProveedorId == request.ProveedorId)
            .Select(pp => pp.ProductoId)
            .ToListAsync(cancellationToken);

        if (!productosIds.Any()) return false;

        // 2. Obtener las variantes de esos productos
        var variantes = await _context.VariantesProducto
            .Where(v => productosIds.Contains(v.ProductId))
            .ToListAsync(cancellationToken);

        if (!variantes.Any()) return false;

        // 3. Aplicar aumento
        var factor = 1 + (request.PorcentajeAumento / 100);
        foreach (var v in variantes)
        {
            v.PrecioCosto *= factor;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
