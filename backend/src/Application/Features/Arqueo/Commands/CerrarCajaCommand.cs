using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using Application.DTOs.Arqueo;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Arqueo.Commands;

public record CerrarCajaCommand(Guid ArqueoId, CerrarCajaDto Payload) : IRequest<bool>;

public class CerrarCajaCommandHandler : IRequestHandler<CerrarCajaCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CerrarCajaCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<bool> Handle(CerrarCajaCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException();
        
        var arqueo = await _context.ArqueosCaja
            .Include(x => x.Detalles)
            .Where(x => x.Id == request.ArqueoId && x.TenantId == tenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (arqueo == null) throw new Exception("Arqueo no encontrado.");
        if (arqueo.Estado != EstadoArqueo.Abierto) throw new Exception("Esta caja ya está cerrada.");

        // Aseguramos que el TenantId esté seteado para que el RLS permita el Update
        arqueo.TenantId = tenantId;

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Forzamos el SET SESSION dentro de la transacción para asegurar que el RLS lo vea
            await _context.Database.ExecuteSqlRawAsync($"SET SESSION \"app.current_tenant\" = '{tenantId}';", cancellationToken);

            var fechaCierre = DateTime.UtcNow;
            
            // 1. Obtener todas las Ventas realizadas durante la sesión (del mismo usuario y sucursal)
            var ventasSesion = await _context.Ventas
                .Where(v => v.TenantId == tenantId && 
                            v.UsuarioId == arqueo.UsuarioId &&
                            v.CreatedAt >= arqueo.FechaApertura &&
                            v.CreatedAt <= fechaCierre)
                .ToListAsync(cancellationToken);

            // 2. Obtener Movimientos de Saldo Manuales (Ingresos/Egresos que pasaron por caja)
            var movimientosManuales = await _context.MovimientosSaldosClientes
                .Where(m => m.TenantId == tenantId &&
                            m.CreatedAt >= arqueo.FechaApertura &&
                            m.CreatedAt <= fechaCierre &&
                            m.MetodoPagoId != null) // Solo los que tienen medio de pago (pasaron por caja física)
                .ToListAsync(cancellationToken);

            // 3. Obtener todos los métodos de pago activos para el desglose
            var metodosPago = await _context.MetodosPago.ToListAsync(cancellationToken);

            decimal totalVentasEsperado = 0;
            decimal totalManualEsperado = 0;
            decimal totalRealContado = 0;

            foreach (var mp in metodosPago)
            {
                // Calcular esperado en Ventas para este medio
                var ventasMonto = ventasSesion
                    .Where(v => v.MetodoPagoId == mp.Id)
                    .Sum(v => v.MontoTotal);

                // Calcular esperado en Movimientos Manuales
                var manualMonto = movimientosManuales
                    .Where(m => m.MetodoPagoId == mp.Id)
                    .Sum(m => m.Tipo == TipoMovimientoSaldo.Ingreso ? m.Monto : -m.Monto);

                var esperadoTotal = ventasMonto + manualMonto;
                
                // Si es Efectivo, se le suma el Saldo Inicial
                if (mp.Nombre.ToLower().Contains("efectivo"))
                {
                    esperadoTotal += arqueo.SaldoInicial;
                }

                // Obtener lo que el cajero dijo que hay (Blind Closing)
                var realCajero = request.Payload.DetallesReales
                    .FirstOrDefault(d => d.MetodoPagoId == mp.Id)?.MontoReal ?? 0;

                var detalle = new ArqueoCajaDetalle
                {
                    TenantId = tenantId,
                    ArqueoCajaId = arqueo.Id,
                    MetodoPagoId = mp.Id,
                    MontoEsperado = esperadoTotal,
                    MontoReal = realCajero,
                    Diferencia = realCajero - esperadoTotal
                };

                arqueo.Detalles.Add(detalle);
                
                totalVentasEsperado += ventasMonto;
                totalManualEsperado += manualMonto;
                totalRealContado += realCajero;
            }

            arqueo.FechaCierre = fechaCierre;
            arqueo.TotalVentasEsperado = totalVentasEsperado;
            arqueo.TotalManualEsperado = totalManualEsperado;
            arqueo.TotalRealContado = totalRealContado;
            arqueo.Diferencia = totalRealContado - (totalVentasEsperado + totalManualEsperado + arqueo.SaldoInicial);
            arqueo.Estado = EstadoArqueo.Cerrado;
            arqueo.Observaciones = request.Payload.Observaciones;

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
