using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Commands;

public class EditarCategoriaCommand : IRequest<bool>
{
    public Guid CategoriaId { get; set; }
    public EditarCategoriaDto Payload { get; set; } = new();
}

public class EditarCategoriaCommandHandler : IRequestHandler<EditarCategoriaCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public EditarCategoriaCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(EditarCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _dbContext.Categorias
            .FirstOrDefaultAsync(c => c.Id == request.CategoriaId, cancellationToken);

        if (categoria == null) return false;

        // Validar que no haya dependencias circulares simples
        if (request.Payload.ParentCategoryId == request.CategoriaId) 
            throw new InvalidOperationException("Una categoría no puede ser su propia categoría padre.");

        categoria.Nombre = request.Payload.Nombre;
        categoria.Descripcion = request.Payload.Descripcion;
        categoria.Ncm = request.Payload.CodigoNcm;
        categoria.ParentId = request.Payload.ParentCategoryId;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
