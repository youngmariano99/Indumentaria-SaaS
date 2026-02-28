using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Commands;

public class EliminarProductoCommand : IRequest<bool>
{
    public Guid ProductoId { get; set; }
}

public class EliminarProductoCommandHandler : IRequestHandler<EliminarProductoCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public EliminarProductoCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(EliminarProductoCommand request, CancellationToken cancellationToken)
    {
        // 1. Obtener producto y ocultarlo (Baja lógica transaccional)
        var producto = await _dbContext.Productos.FirstOrDefaultAsync(p => p.Id == request.ProductoId, cancellationToken);
        
        if (producto == null)
            return false;

        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            producto.IsDeleted = true;

            // 2. Ocultar también sus variantes para no corromper la consistencia
            var variantes = await _dbContext.VariantesProducto
                .Where(v => v.ProductId == request.ProductoId)
                .ToListAsync(cancellationToken);

            foreach (var variante in variantes)
            {
                variante.IsDeleted = true;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
