using Application.Common.Interfaces;
using Application.Features.Reports.DTOs;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Reports.Queries;

public class ObtenerCajaFerreteriaQuery : IRequest<CajaDetalleFerreteriaDto> { }

public class ObtenerCajaFerreteriaHandler : IRequestHandler<ObtenerCajaFerreteriaQuery, CajaDetalleFerreteriaDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerCajaFerreteriaHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<CajaDetalleFerreteriaDto> Handle(ObtenerCajaFerreteriaQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;
        var hoy = DateTime.UtcNow.Date;

        // 1. Ventas Directas en Efectivo (Sin pasar por CC, o ventas del día)
        // Nota: En un sistema real, filtraríamos por MetodoPago "Efectivo"
        var ventasEfectivo = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hoy && v.MetodoPago.Nombre.Contains("Efectivo"))
            .SumAsync(v => v.MontoTotal, cancellationToken);

        // 2. Cobranzas de Cuentas Corrientes (Ingresos a Billetera)
        var cobranzasCC = await _context.MovimientosSaldosClientes
            .Where(m => m.TenantId == tenantId && 
                        m.CreatedAt >= hoy && 
                        m.Tipo == Core.Entities.TipoMovimientoSaldo.Ingreso &&
                        m.MetodoPago != null && m.MetodoPago.Nombre.Contains("Efectivo"))
            .SumAsync(m => m.Monto, cancellationToken);
            
        // 3. Otros métodos (Tarjetas, Transferencias)
        var cobranzasOtros = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.CreatedAt >= hoy && !v.MetodoPago.Nombre.Contains("Efectivo"))
            .SumAsync(v => v.MontoTotal, cancellationToken);

        return new CajaDetalleFerreteriaDto
        {
            VentasDirectasEfectivo = ventasEfectivo,
            CobranzasCuentasCorrientes = cobranzasCC,
            CobranzasOtrosMetodos = cobranzasOtros
        };
    }
}
