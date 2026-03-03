using Application.Common.Interfaces;
using Application.Features.Reports.DTOs;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Reports.Queries;

public class ObtenerPulsoDiarioQuery : IRequest<PulsoDiarioDto> { }

public class ObtenerPulsoDiarioHandler : IRequestHandler<ObtenerPulsoDiarioQuery, PulsoDiarioDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerPulsoDiarioHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<PulsoDiarioDto> Handle(ObtenerPulsoDiarioQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;
        var hoyUTC = DateTime.UtcNow.Date;

        // 1. Ventas de Hoy
        var ventasHoy = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hoyUTC)
            .Include(v => v.MetodoPago)
            .Include(v => v.Detalles)
            .ToListAsync(cancellationToken);

        var totalVentas = ventasHoy.Sum(v => v.MontoTotal);
        var cantTickets = ventasHoy.Count;

        // 2. Desglose por Método de Pago (Arqueo)
        // Agrupar por el Nombre del Método de Pago
        var resumenMetodos = ventasHoy
            .GroupBy(v => v.MetodoPago.Nombre)
            .Select(g => new MetodoPagoResumenDto
            {
                Nombre = g.Key,
                MontoTotal = g.Sum(v => v.MontoTotal),
                CantidadOperaciones = g.Count()
            })
            .ToList();

        // 3. Productos Estrella (Top 5 hoy)
        var topProductos = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hoyUTC)
            .SelectMany(v => v.Detalles)
            .GroupBy(d => d.VarianteProducto.ProductId) // Agrupar por Producto, no por variante para el Top 5 general
            .Select(g => new RankingProductoDto
            {
                Nombre = _context.Productos.Where(p => p.Id == g.Key).Select(p => p.Nombre).FirstOrDefault() ?? "Desconocido",
                CantidadVendida = g.Sum(d => d.Cantidad),
                TotalMonto = g.Sum(d => d.SubtotalLinea)
            })
            .OrderByDescending(r => r.CantidadVendida)
            .Take(5)
            .ToListAsync(cancellationToken);

        // 4. Stock Crítico
        var bajoStock = await _context.Inventarios
            .Where(i => i.TenantId == tenantId && i.StockActual <= i.StockMinimo)
            .CountAsync(cancellationToken);

        return new PulsoDiarioDto
        {
            TotalVentasHoy = totalVentas,
            CantidadTicketsHoy = cantTickets,
            TicketPromedioHoy = cantTickets > 0 ? Math.Round(totalVentas / cantTickets, 2) : 0,
            MetodoPagoResumen = resumenMetodos,
            ProductosEstrella = topProductos,
            VariantesBajoStockMinimo = bajoStock
        };
    }
}
