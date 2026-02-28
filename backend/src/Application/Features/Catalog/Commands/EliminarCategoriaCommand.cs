using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Commands;

public class EliminarCategoriaCommand : IRequest<bool>
{
    public Guid CategoriaId { get; set; }
}

public class EliminarCategoriaCommandHandler : IRequestHandler<EliminarCategoriaCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public EliminarCategoriaCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(EliminarCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _dbContext.Categorias
            .FirstOrDefaultAsync(c => c.Id == request.CategoriaId, cancellationToken);

        if (categoria == null) return false;

        // Verificar si tiene subcategorías
        var tieneSubcat = await _dbContext.Categorias.AnyAsync(c => c.ParentId == request.CategoriaId, cancellationToken);
        if (tieneSubcat) throw new InvalidOperationException("No se puede eliminar una categoría que contiene sub-categorías. Elimínelas o reasígnelas primero.");

        // Verificar si tiene productos asignados
        var tieneProductos = await _dbContext.Productos.AnyAsync(p => p.CategoriaId == request.CategoriaId, cancellationToken);
        if (tieneProductos) throw new InvalidOperationException("No se puede eliminar una categoría con productos asignados. Reasigne los productos primero.");

        // Hard/Soft delete según configuración de entidad (implementa soft-delete en EFCore config)
        _dbContext.Categorias.Remove(categoria);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
