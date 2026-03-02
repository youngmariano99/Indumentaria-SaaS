using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Queries;

/// <summary>
/// Devuelve productos cuyo stock total (suma de variantes) es mayor que 0 y menor al umbral.
/// </summary>
public record ObtenerProductosStockBajoQuery(int Umbral) : IRequest<List<ProductoStockResumenDto>>;

/// <summary>
/// Devuelve productos cuyo stock total (suma de variantes) es exactamente 0.
/// </summary>
public record ObtenerProductosSinStockQuery() : IRequest<List<ProductoStockResumenDto>>;

/// <summary>
/// Devuelve los productos más vendidos de la última semana (top N, por defecto 3).
/// </summary>
public record ObtenerTopProductosSemanaQuery(int TopN = 3) : IRequest<List<ProductoVentaSemanaDto>>;

public class CatalogoAsistidoQueryHandler :
    IRequestHandler<ObtenerProductosStockBajoQuery, List<ProductoStockResumenDto>>,
    IRequestHandler<ObtenerProductosSinStockQuery, List<ProductoStockResumenDto>>,
    IRequestHandler<ObtenerTopProductosSemanaQuery, List<ProductoVentaSemanaDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public CatalogoAsistidoQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ProductoStockResumenDto>> Handle(
        ObtenerProductosStockBajoQuery request,
        CancellationToken cancellationToken)
    {
        var productos = await CalcularProductosConStockAsync(cancellationToken);

        var umbral = Math.Max(1, request.Umbral);

        return productos
            .Where(p => p.StockTotal > 0 && p.StockTotal < umbral)
            .OrderBy(p => p.StockTotal)
            .ToList();
    }

    public async Task<List<ProductoStockResumenDto>> Handle(
        ObtenerProductosSinStockQuery request,
        CancellationToken cancellationToken)
    {
        var productos = await CalcularProductosConStockAsync(cancellationToken);

        // Para "sin stock" el interés está en las variantes con stock 0.
        // Reutilizamos ProductoStockResumenDto pero filtrando las variantes y
        // usando StockTotal como "cantidad de variantes sin stock".
        var resultado = new List<ProductoStockResumenDto>();

        foreach (var p in productos)
        {
            var variantesSinStock = p.Variantes
                .Where(v => v.StockActual == 0)
                .ToList();

            if (!variantesSinStock.Any())
            {
                continue;
            }

            resultado.Add(new ProductoStockResumenDto
            {
                ProductoId = p.ProductoId,
                Nombre = p.Nombre,
                StockTotal = variantesSinStock.Count,
                Variantes = variantesSinStock
            });
        }

        return resultado
            .OrderByDescending(p => p.StockTotal)
            .ThenBy(p => p.Nombre)
            .ToList();
    }

    public async Task<List<ProductoVentaSemanaDto>> Handle(
        ObtenerTopProductosSemanaQuery request,
        CancellationToken cancellationToken)
    {
        var desde = DateTime.UtcNow.Date.AddDays(-7);

        var ventasQuery = _dbContext.Ventas
            .Where(v => v.CreatedAt >= desde && v.EstadoVenta != EstadoVenta.Anulada);

        var ventasConDetalles = await _dbContext.VentasDetalles
            .Where(d => ventasQuery.Select(v => v.Id).Contains(d.VentaId))
            .ToListAsync(cancellationToken);

        if (!ventasConDetalles.Any())
        {
            return new List<ProductoVentaSemanaDto>();
        }

        var variantesIds = ventasConDetalles
            .Select(d => d.VarianteProductoId)
            .Distinct()
            .ToList();

        var variantes = await _dbContext.VariantesProducto
            .Where(v => variantesIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        var productosIds = variantes
            .Select(v => v.ProductId)
            .Distinct()
            .ToList();

        var productos = await _dbContext.Productos
            .Where(p => productosIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Nombre, cancellationToken);

        var ventasPorProducto = ventasConDetalles
            .GroupBy(d =>
            {
                var variante = variantes.FirstOrDefault(v => v.Id == d.VarianteProductoId);
                return variante?.ProductId ?? Guid.Empty;
            })
            .Where(g => g.Key != Guid.Empty)
            .Select(g => new
            {
                ProductoId = g.Key,
                Unidades = g.Sum(d => d.Cantidad),
                Importe = g.Sum(d => d.SubtotalLinea)
            })
            .ToList();

        var topN = Math.Max(1, request.TopN);

        return ventasPorProducto
            .OrderByDescending(x => x.Unidades)
            .ThenByDescending(x => x.Importe)
            .Take(topN)
            .Select(x => new ProductoVentaSemanaDto
            {
                ProductoId = x.ProductoId,
                Nombre = productos.TryGetValue(x.ProductoId, out var nombre) ? nombre : string.Empty,
                UnidadesVendidas = x.Unidades,
                ImporteTotal = x.Importe
            })
            .ToList();
    }

    private async Task<List<ProductoStockResumenDto>> CalcularProductosConStockAsync(
        CancellationToken cancellationToken)
    {
        var productos = await _dbContext.Productos
            .OrderBy(p => p.Nombre)
            .ToListAsync(cancellationToken);

        var productIds = productos.Select(p => p.Id).ToList();

        var variantes = await _dbContext.VariantesProducto
            .Where(v => productIds.Contains(v.ProductId))
            .ToListAsync(cancellationToken);

        var varianteIds = variantes.Select(v => v.Id).ToList();

        var inventarios = await _dbContext.Inventarios
            .Where(i => varianteIds.Contains(i.ProductVariantId))
            .ToListAsync(cancellationToken);

        var stockPorVariante = inventarios
            .GroupBy(i => i.ProductVariantId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.StockActual));

        var stockPorProducto = variantes
            .GroupBy(v => v.ProductId)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(v => stockPorVariante.TryGetValue(v.Id, out var stock) ? stock : 0));

        var resultado = new List<ProductoStockResumenDto>();

        foreach (var producto in productos)
        {
            if (!stockPorProducto.TryGetValue(producto.Id, out var stockTotal))
            {
                stockTotal = 0;
            }

            var variantesProducto = variantes
                .Where(v => v.ProductId == producto.Id)
                .ToList();

            var variantesDto = variantesProducto
                .Select(v => new VarianteStockResumenDto
                {
                    VarianteId = v.Id,
                    SKU = v.SKU,
                    Talle = v.Talle,
                    Color = v.Color,
                    StockActual = stockPorVariante.TryGetValue(v.Id, out var stockVar)
                        ? stockVar
                        : 0
                })
                .ToList();

            resultado.Add(new ProductoStockResumenDto
            {
                ProductoId = producto.Id,
                Nombre = producto.Nombre,
                StockTotal = stockTotal,
                Variantes = variantesDto
            });
        }

        return resultado;
    }
}

