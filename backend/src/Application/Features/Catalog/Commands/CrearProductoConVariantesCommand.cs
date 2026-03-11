using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using Application.Shared.Interfaces;
using Core.Entities;
using Core.Interfaces;
using MediatR;

namespace Application.Features.Catalog.Commands;

public class CrearProductoConVariantesCommand : IRequest<Guid>
{
    public CrearProductoDto Payload { get; set; } = new();
}

public class CrearProductoConVariantesCommandHandler : IRequestHandler<CrearProductoConVariantesCommand, Guid>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;
    private readonly ICreadorProductoStrategy _creadorStrategy;

    public CrearProductoConVariantesCommandHandler(IApplicationDbContext dbContext, ITenantResolver tenantResolver, ICreadorProductoStrategy creadorStrategy)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
        _creadorStrategy = creadorStrategy;
    }

    public async Task<Guid> Handle(CrearProductoConVariantesCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant no identificado.");
        var dto = request.Payload;

        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Crear el producto padre
            var producto = new Producto
            {
                TenantId = tenantId,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                PrecioBase = dto.PrecioBase,
                CategoriaId = dto.CategoriaId,
                Temporada = dto.Temporada,
                TipoProducto = dto.TipoProducto,
                PesoKg = dto.PesoKg,
                Ean13 = dto.Ean13,
                Origen = dto.Origen,
                EscalaTalles = dto.EscalaTalles
            };

            await _dbContext.Productos.AddAsync(producto, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // 2. Delegar la creación de variantes y sus registros de inventario a la estrategia
            var (variantes, inventarios) = await _creadorStrategy.GenerarVariantesEInventarioAsync(producto, dto, tenantId);

            if (variantes.Any())
            {
                await _dbContext.VariantesProducto.AddRangeAsync(variantes, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            if (inventarios.Any())
            {
                await _dbContext.Inventarios.AddRangeAsync(inventarios, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
            return producto.Id;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
