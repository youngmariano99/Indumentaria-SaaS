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

        var varianteDefault = new VarianteProducto
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ProductId = productoPadre.Id,
            Talle = "Única",
            Color = "Único",
            SKU = string.IsNullOrWhiteSpace(dto.Ean13) ? GenerarSkuAutomatico(productoPadre.Id) : dto.Ean13,
            PrecioCosto = 0,
            PrecioOverride = null,
            AtributosJson = "{}"
        };

        variantesList.Add(varianteDefault);

        inventariosList.Add(new Inventario
        {
            TenantId = tenantId,
            StoreId = Guid.Empty, // Placeholder
            ProductVariantId = varianteDefault.Id,
            StockActual = dto.Variantes?.FirstOrDefault()?.StockInicial ?? 0,
            StockMinimo = 0
        });

        return Task.FromResult((variantesList, inventariosList));
    }

    private string GenerarSkuAutomatico(Guid productId)
    {
        var shortId = productId.ToString()[..8].ToUpperInvariant();
        return $"{shortId}-DEF";
    }
}
