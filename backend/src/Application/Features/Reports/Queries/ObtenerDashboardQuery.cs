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

public class ObtenerDashboardQuery : IRequest<DashboardDto> { }

public class ObtenerDashboardHandler : IRequestHandler<ObtenerDashboardQuery, DashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerDashboardHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<DashboardDto> Handle(ObtenerDashboardQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;
        var hoyUTC = DateTime.UtcNow.Date;
        var hace7Dias = hoyUTC.AddDays(-6);
        var hace24Horas = DateTime.UtcNow.AddDays(-1);

        // 1. Métricas de Usuarios y Membresía
        var usuariosRegistrados = await _context.Usuarios
            .Where(u => u.TenantId == tenantId)
            .CountAsync(cancellationToken);

        var usuariosActivos = await _context.LogsAuditoria
            .Where(l => l.TenantId == tenantId && l.Timestamp >= hace24Horas)
            .Select(l => l.UserId)
            .Distinct()
            .CountAsync(cancellationToken);

        var membresiaActiva = await _context.ModulosSuscripcion
            .Where(m => m.TenantId == tenantId && m.IsActive)
            .ToListAsync(cancellationToken);

        int diasRestantes = 0;
        if (membresiaActiva.Any())
        {
            var maxFecha = membresiaActiva.Max(m => m.ValidUntil);
            var diferencia = maxFecha - DateTime.UtcNow;
            diasRestantes = diferencia.Days > 0 ? diferencia.Days : 0;
        }

        // 2. Métricas de Productos
        var productos = await _context.Productos
            .Where(p => p.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var totalProductos = productos.Count;
        var productosNuevosHoy = productos.Count(p => p.CreatedAt >= hoyUTC);

        var inventarios = await _context.Inventarios
            .Where(i => i.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var productosSinStock = inventarios.Count(i => i.StockActual == 0);
        var productosStockBajo = inventarios.Count(i => i.StockActual > 0 && i.StockActual <= i.StockMinimo);

        // 3. Ventas últimos 7 días
        var ventasRecientes = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hace7Dias)
            .ToListAsync(cancellationToken);

        var ventasUltimos7Dias = new List<VentaDiariaDto>();
        for (int i = 0; i < 7; i++)
        {
            var fecha = hace7Dias.AddDays(i);
            var monto = ventasRecientes
                .Where(v => v.CreatedAt.Date == fecha.Date)
                .Sum(v => v.MontoTotal);

            ventasUltimos7Dias.Add(new VentaDiariaDto
            {
                Dia = fecha.ToString("ddd"),
                Valor = monto
            });
        }

        // 4. Métodos de Pago Hoy
        var ventasHoy = ventasRecientes.Where(v => v.CreatedAt >= hoyUTC).ToList();
        var metodosPagoHoy = ventasHoy
            .GroupBy(v => v.MetodoPagoId)
            .Select(g => new MetodoPagoResumenDto
            {
                Nombre = _context.MetodosPago.FirstOrDefault(m => m.Id == g.Key)?.Nombre ?? "Otro",
                MontoTotal = g.Sum(v => v.MontoTotal),
                CantidadOperaciones = g.Count()
            })
            .ToList();

        // 5. Cartera de Clientes
        var clientes = await _context.Clientes
            .Where(c => c.TenantId == tenantId && !c.IsDeleted)
            .ToListAsync(cancellationToken);

        var carteraClientes = new CarteraClientesDto
        {
            ClientesActivos = clientes.Count,
            ClientesConDeuda = clientes.Count(c => c.SaldoAFavor < 0),
            DeudaTotal = Math.Abs(clientes.Where(c => c.SaldoAFavor < 0).Sum(c => c.SaldoAFavor))
        };

        // 6. Top Productos (Semana)
        var topProductosSemana = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hace7Dias)
            .SelectMany(v => v.Detalles)
            .GroupBy(d => d.VarianteProducto.ProductId)
            .Select(g => new RankingProductoDto
            {
                Nombre = _context.Productos.Where(p => p.Id == g.Key).Select(p => p.Nombre).FirstOrDefault() ?? "Desconocido",
                CantidadVendida = g.Sum(d => d.Cantidad),
                TotalMonto = g.Sum(d => d.SubtotalLinea)
            })
            .OrderByDescending(r => r.CantidadVendida)
            .Take(5)
            .ToListAsync(cancellationToken);

        return new DashboardDto
        {
            UsuariosActivos = usuariosActivos,
            UsuariosRegistrados = usuariosRegistrados,
            DiasRestantesMembresia = diasRestantes,
            TotalProductos = totalProductos,
            ProductosNuevosHoy = productosNuevosHoy,
            ProductosSinStock = productosSinStock,
            ProductosStockBajo = productosStockBajo,
            VentasUltimos7Dias = ventasUltimos7Dias,
            MetodosPagoHoy = metodosPagoHoy,
            CarteraClientes = carteraClientes,
            TopProductosSemana = topProductosSemana
        };
    }
}
