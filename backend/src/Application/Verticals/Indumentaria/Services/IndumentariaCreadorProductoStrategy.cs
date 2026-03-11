using System.Text.Json;
using Application.DTOs.Catalog;
using Application.Shared.Interfaces;
using Core.Entities;

namespace Application.Verticals.Indumentaria.Services;

public class IndumentariaCreadorProductoStrategy : ICreadorProductoStrategy
{
    public Task<(List<VarianteProducto> Variantes, List<Inventario> Inventarios)> GenerarVariantesEInventarioAsync(Producto productoPadre, CrearProductoDto dto, Guid tenantId)
    {
        var variantesList = new List<VarianteProducto>();
        var inventariosList = new List<Inventario>();

        if (dto.Variantes != null && dto.Variantes.Any())
        {
            variantesList = dto.Variantes.Select(v => new VarianteProducto
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ProductId = productoPadre.Id,
                Talle = v.Talle ?? "Único",
                Color = v.Color ?? "Único",
                SKU = string.IsNullOrWhiteSpace(v.SKU) ? GenerarSkuAutomatico(productoPadre.Id, v.Talle, v.Color) : v.SKU,
                PrecioCosto = v.PrecioCosto,
                PrecioOverride = v.PrecioOverride,
                AtributosJson = v.Atributos != null && v.Atributos.Count > 0
                    ? JsonSerializer.Serialize(v.Atributos)
                    : "{}"
            }).ToList();

            inventariosList = variantesList.Zip(dto.Variantes, (variante, varianteDto) => new Inventario
            {
                TenantId = tenantId,
                StoreId = Guid.Empty,           // Sucursal global placeholder
                ProductVariantId = variante.Id,
                StockActual = varianteDto.StockInicial,
                StockMinimo = 0
            }).ToList();
        }

        return Task.FromResult((variantesList, inventariosList));
    }

    private string GenerarSkuAutomatico(Guid productId, string? talle, string? color)
    {
        var shortId = productId.ToString()[..8].ToUpperInvariant();
        var t = talle ?? "U";
        var c = color ?? "U";
        var shortTalle = t.Length >= 2 ? t[..2].ToUpperInvariant() : t.ToUpperInvariant();
        var shortColor = c.Length >= 3 ? c[..3].ToUpperInvariant() : c.ToUpperInvariant();
        return $"{shortId}-{shortTalle}-{shortColor}";
    }
}
