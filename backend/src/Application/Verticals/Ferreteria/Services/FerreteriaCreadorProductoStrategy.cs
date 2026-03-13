using System.Text.Json;
using Application.DTOs.Catalog;
using Application.Shared.Interfaces;
using Core.Entities;

namespace Application.Verticals.Ferreteria.Services;

public class FerreteriaCreadorProductoStrategy : ICreadorProductoStrategy
{
    public Task<(List<VarianteProducto> Variantes, List<Inventario> Inventarios)> GenerarVariantesEInventarioAsync(Producto productoPadre, CrearProductoDto dto, Guid tenantId)
    {
        var variantesList = new List<VarianteProducto>();
        var inventariosList = new List<Inventario>();

        // Si el DTO no trae variantes (caso raro en el flujo actual), generamos una por defecto
        if (dto.Variantes == null || !dto.Variantes.Any())
        {
            var varianteDefault = new VarianteProducto
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ProductId = productoPadre.Id,
                Talle = "Único", // En ferretería usamos estos campos como dimensiones genéricas
                Color = "N/A",
                SKU = string.IsNullOrWhiteSpace(dto.Ean13) ? GenerarSkuAutomatico(productoPadre.Id, "DEF") : dto.Ean13,
                PrecioCosto = 0,
                PrecioOverride = null,
                AtributosJson = "{}"
            };
            variantesList.Add(varianteDefault);
            inventariosList.Add(new Inventario
            {
                TenantId = tenantId,
                StoreId = Guid.Empty,
                ProductVariantId = varianteDefault.Id,
                StockActual = 0,
                StockMinimo = 0
            });
        }
        else
        {
            foreach (var v in dto.Variantes)
            {
                var variante = new VarianteProducto
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ProductId = productoPadre.Id,
                    Talle = v.Talle,
                    Color = v.Color,
                    SKU = string.IsNullOrWhiteSpace(v.SKU) ? GenerarSkuAutomatico(productoPadre.Id, v.Talle) : v.SKU,
                    PrecioCosto = v.PrecioCosto,
                    PrecioOverride = v.PrecioOverride,
                    AtributosJson = JsonSerializer.Serialize(v.Atributos ?? new Dictionary<string, string>())
                };
                variantesList.Add(variante);
                inventariosList.Add(new Inventario
                {
                    TenantId = tenantId,
                    StoreId = Guid.Empty,
                    ProductVariantId = variante.Id,
                    StockActual = v.StockInicial,
                    StockMinimo = 0
                });
            }
        }

        return Task.FromResult((variantesList, inventariosList));
    }

    private string GenerarSkuAutomatico(Guid productId, string suffix)
    {
        var shortId = productId.ToString()[..8].ToUpperInvariant();
        var cleanSuffix = suffix.Replace(" ", "").ToUpperInvariant();
        return $"{shortId}-{cleanSuffix}";
    }
}
