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

public class ObtenerReporteCorporativoQuery : IRequest<ReporteCorporativoDto> { }

public class ObtenerReporteCorporativoHandler : IRequestHandler<ObtenerReporteCorporativoQuery, ReporteCorporativoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerReporteCorporativoHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<ReporteCorporativoDto> Handle(ObtenerReporteCorporativoQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;

        // 1. Obtener todas las ventas con sus detalles (Histórico)
        var todosLosDetalles = await _context.Ventas
            .Where(v => v.TenantId == tenantId)
            .SelectMany(v => v.Detalles)
            .Select(d => new { d.VarianteProducto.ProductId, d.SubtotalLinea, d.CostoUnitarioAplicado, d.Cantidad })
            .ToListAsync(cancellationToken);

        if (!todosLosDetalles.Any()) return new ReporteCorporativoDto();

        // 2. Agrupar por Producto para Análisis ABC y Rentabilidad
        var resumenPorProducto = todosLosDetalles
            .GroupBy(d => d.ProductId)
            .Select(g => new
            {
                ProductoId = g.Key,
                IngresosTotales = g.Sum(x => x.SubtotalLinea),
                CostosTotales = g.Sum(x => x.CostoUnitarioAplicado * x.Cantidad),
                Nombre = _context.Productos.Where(p => p.Id == g.Key).Select(p => p.Nombre).FirstOrDefault() ?? "Desconocido"
            })
            .OrderByDescending(x => x.IngresosTotales)
            .ToList();

        decimal ingresosGlobales = resumenPorProducto.Sum(x => x.IngresosTotales);
        decimal costosGlobales = resumenPorProducto.Sum(x => x.CostosTotales);

        // 3. Cálculo de Matriz ABC (Pareto)
        var matrizABC = new List<ItemABCModel>();
        decimal acumulado = 0;

        foreach (var item in resumenPorProducto)
        {
            acumulado += item.IngresosTotales;
            decimal porcentajeAcumulado = (acumulado / ingresosGlobales) * 100m;
            decimal porcentajeIndividual = (item.IngresosTotales / ingresosGlobales) * 100m;

            string clasificacion = "C";
            if (porcentajeAcumulado <= 80) clasificacion = "A";
            else if (porcentajeAcumulado <= 95) clasificacion = "B";

            matrizABC.Add(new ItemABCModel
            {
                ProductoNombre = item.Nombre,
                IngresosAcumulados = item.IngresosTotales,
                PorcentajeDelTotal = Math.Round(porcentajeIndividual, 2),
                Clasificacion = clasificacion,
                Rentabilidad = item.IngresosTotales - item.CostosTotales
            });
        }

        return new ReporteCorporativoDto
        {
            MatrizABC = matrizABC,
            MargenBrutoTotal = ingresosGlobales - costosGlobales,
            PorcentajeMargenBruto = ingresosGlobales > 0 ? Math.Round(((ingresosGlobales - costosGlobales) / ingresosGlobales) * 100m, 2) : 0
        };
    }
}
