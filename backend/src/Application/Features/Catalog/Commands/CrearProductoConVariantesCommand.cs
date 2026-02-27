using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
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

    public CrearProductoConVariantesCommandHandler(IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
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
                TipoProducto = dto.TipoProducto
            };

            await _dbContext.Productos.AddAsync(producto, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // 2. Crear las variantes y sus registros de inventario
            if (dto.Variantes != null && dto.Variantes.Any())
            {
                var variantes = dto.Variantes.Select(v => new VarianteProducto
                {
                    TenantId = tenantId,
                    ProductId = producto.Id,
                    Talle = v.Talle,
                    Color = v.Color,
                    SKU = string.IsNullOrWhiteSpace(v.SKU) ? GenerarSkuAutomatico(producto.Id, v.Talle, v.Color) : v.SKU,
                    PrecioCosto = v.PrecioCosto,
                    PrecioOverride = v.PrecioOverride,
                    AtributosJson = v.Atributos != null && v.Atributos.Count > 0
                        ? JsonSerializer.Serialize(v.Atributos)
                        : "{}"
                }).ToList();

                await _dbContext.VariantesProducto.AddRangeAsync(variantes, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);

                // 3. Crear registros de Inventario iniciales (uno por variante)
                // StoreId usa Guid.Empty como "sucursal global" hasta que exista el módulo de sucursales
                var inventarios = variantes.Zip(dto.Variantes, (variante, varianteDto) => new Inventario
                {
                    TenantId = tenantId,
                    StoreId = Guid.Empty,           // Sucursal global placeholder
                    ProductVariantId = variante.Id,
                    StockActual = varianteDto.StockInicial,
                    StockMinimo = 0
                }).ToList();

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

    private string GenerarSkuAutomatico(Guid productId, string talle, string color)
    {
        var shortId = productId.ToString()[..8].ToUpperInvariant();
        var shortTalle = talle.Length >= 2 ? talle[..2].ToUpperInvariant() : talle.ToUpperInvariant();
        var shortColor = color.Length >= 3 ? color[..3].ToUpperInvariant() : color.ToUpperInvariant();
        return $"{shortId}-{shortTalle}-{shortColor}";
    }
}
