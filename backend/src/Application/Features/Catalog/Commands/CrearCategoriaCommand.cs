using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using Core.Entities;
using Core.Interfaces;
using MediatR;

namespace Application.Features.Catalog.Commands;

public class CrearCategoriaCommand : IRequest<Guid>
{
    public CrearCategoriaDto Payload { get; set; } = new();
}

public class CrearCategoriaCommandHandler : IRequestHandler<CrearCategoriaCommand, Guid>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public CrearCategoriaCommandHandler(IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CrearCategoriaCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        var categoria = new Categoria
        {
            TenantId = tenantId,
            Nombre = request.Payload.Nombre,
            Descripcion = request.Payload.Descripcion,
            Ncm = request.Payload.CodigoNcm,
            ParentId = request.Payload.ParentCategoryId
        };

        await _dbContext.Categorias.AddAsync(categoria, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return categoria.Id;
    }
}
