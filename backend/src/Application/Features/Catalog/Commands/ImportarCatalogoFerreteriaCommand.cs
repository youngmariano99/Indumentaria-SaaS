using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Core.Enums;

namespace Application.Features.Catalog.Commands;

/// <summary>
/// Comando especializado para importar catálogos de ferretería.
/// Permite mapear columnas técnicas (Medida, Material, etc) directamente a JSONB.
/// </summary>
public class ImportarCatalogoFerreteriaCommand : IRequest<int>
{
    public List<ImportarFerreteriaDto> Productos { get; set; } = new();
}

public class ImportarCatalogoFerreteriaCommandHandler : IRequestHandler<ImportarCatalogoFerreteriaCommand, int>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public ImportarCatalogoFerreteriaCommandHandler(IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task<int> Handle(ImportarCatalogoFerreteriaCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        if (request.Productos == null || !request.Productos.Any())
            return 0;

        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            int productosCreados = 0;
            
            // Caché de categorías para minimizar hits a DB
            var categoriasCache = await _dbContext.Categorias
                .Where(c => c.TenantId == tenantId)
                .ToDictionaryAsync(c => c.Nombre.ToLower(), c => c.Id, cancellationToken);

            foreach (var dto in request.Productos)
            {
                // 1. Resolver Categoría
                Guid? catId = null;
                if (!string.IsNullOrWhiteSpace(dto.CategoriaNombre))
                {
                    var catNombreLower = dto.CategoriaNombre.Trim().ToLower();
                    if (categoriasCache.TryGetValue(catNombreLower, out var existingId))
                    {
                        catId = existingId;
                    }
                    else
                    {
                        var nuevaCat = new Categoria
                        {
                            TenantId = tenantId,
                            Nombre = dto.CategoriaNombre.Trim(),
                            EsquemaAtributosJson = "[]"
                        };
                        await _dbContext.Categorias.AddAsync(nuevaCat, cancellationToken);
                        await _dbContext.SaveChangesAsync(cancellationToken);
                        catId = nuevaCat.Id;
                        categoriasCache[catNombreLower] = catId.Value;
                    }
                }

                // 2. Crear Producto Padre
                var producto = new Producto
                {
                    TenantId = tenantId,
                    Nombre = dto.Nombre,
                    Descripcion = dto.Descripcion ?? string.Empty,
                    PrecioBase = dto.PrecioVenta,
                    CategoriaId = catId ?? Guid.Empty, // Se recomienda tener una categoria por defecto
                    TipoProducto = TipoProducto.Ferreteria,
                    Ean13 = dto.Ean13 ?? string.Empty,
                    Origen = "Importación"
                };

                await _dbContext.Productos.AddAsync(producto, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);

                // 3. Crear Variante (Cada fila de importación se trata como una variante única)
                // Adaptamos Talle/Color a los metadatos más comunes de ferretería para mantener compatibilidad
                string talle = dto.Metadatos.ContainsKey("Medida") ? dto.Metadatos["Medida"] : 
                               (dto.Metadatos.Count > 0 ? dto.Metadatos.Values.First() : "Única");
                
                string color = dto.Metadatos.ContainsKey("Material") ? dto.Metadatos["Material"] : 
                               (dto.Metadatos.Count > 1 ? dto.Metadatos.Values.ElementAt(1) : "Estándar");

                var variante = new VarianteProducto
                {
                    TenantId = tenantId,
                    ProductId = producto.Id,
                    Talle = talle ?? "Única",
                    Color = color ?? "Estándar",
                    SKU = !string.IsNullOrWhiteSpace(dto.SKU) ? dto.SKU : $"{producto.Nombre[..Math.Min(3, producto.Nombre.Length)].ToUpper()}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
                    PrecioCosto = dto.PrecioCosto,
                    PrecioOverride = dto.PrecioVenta,
                    AtributosJson = JsonSerializer.Serialize(dto.Metadatos ?? new Dictionary<string, string>())
                };

                await _dbContext.VariantesProducto.AddAsync(variante, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);

                // 4. Stock Inicial
                var inventario = new Inventario
                {
                    TenantId = tenantId,
                    StoreId = Guid.Empty, // Placeholder para sucursal principal
                    ProductVariantId = variante.Id,
                    StockActual = (int)dto.StockInicial,
                    StockMinimo = 5
                };

                await _dbContext.Inventarios.AddAsync(inventario, cancellationToken);
                
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
}
