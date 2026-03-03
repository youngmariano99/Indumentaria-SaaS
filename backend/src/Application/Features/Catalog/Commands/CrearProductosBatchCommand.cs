using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using Core.Entities;
using Core.Interfaces;
using MediatR;

namespace Application.Features.Catalog.Commands;

/// <summary>
/// Propósito: Permitir la creación masiva de productos y sus variantes en una sola transacción.
/// Lógica: Itera sobre una lista de productos, crea la entidad padre, sus variantes e inventario inicial.
/// Dependencias: IApplicationDbContext, ITenantResolver.
/// </summary>
public class CrearProductosBatchCommand : IRequest<int>
{
    public List<CrearProductoDto> Productos { get; set; } = new();
}

public class CrearProductosBatchCommandHandler : IRequestHandler<CrearProductosBatchCommand, int>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public CrearProductosBatchCommandHandler(IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task<int> Handle(CrearProductosBatchCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant no identificado.");
        
        if (request.Productos == null || !request.Productos.Any())
            return 0;

        // Limitar el número de productos por batch para evitar problemas de memoria/timeout
        if (request.Productos.Count > 500)
            throw new ArgumentException("El batch excede el límite permitido de 500 productos.");

        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            int productosCreados = 0;

            foreach (var dto in request.Productos)
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
                
                // Necesitamos el ID del producto para las variantes, así que guardamos cambios parciales en el contexto.
                await _dbContext.SaveChangesAsync(cancellationToken);

                // 2. Crear las variantes
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

                    // 3. Crear registros de Inventario iniciales
                    var inventarios = variantes.Zip(dto.Variantes, (variante, varianteDto) => new Inventario
                    {
                        TenantId = tenantId,
                        StoreId = Guid.Empty, // Sucursal global placeholder
                        ProductVariantId = variante.Id,
                        StockActual = varianteDto.StockInicial,
                        StockMinimo = 0
                    }).ToList();

                    await _dbContext.Inventarios.AddRangeAsync(inventarios, cancellationToken);
                }

                productosCreados++;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            
            return productosCreados;
        }
        catch (Exception)
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
