using Application.Common.Interfaces;
using Application.DTOs.Ventas;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Commands;

/// <summary>
/// Propósito: Registrar un pago de un cliente para reducir su deuda o aumentar su saldo a favor.
/// Lógica: Crea un movimiento de saldo de tipo Ingreso y actualiza el SaldoAFavor del cliente.
/// </summary>
public record RegistrarPagoCuentaCorrienteCommand(RegistrarPagoDto Payload) : IRequest<Guid>;

public class RegistrarPagoCuentaCorrienteCommandHandler : IRequestHandler<RegistrarPagoCuentaCorrienteCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public RegistrarPagoCuentaCorrienteCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(RegistrarPagoCuentaCorrienteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant inválido.");
        var p = request.Payload;

        if (p.Monto <= 0) throw new Exception("El monto debe ser mayor a cero.");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == p.ClienteId && c.TenantId == tenantId, cancellationToken);
        
        if (cliente == null) throw new Exception("Cliente no encontrado.");

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Crear el movimiento de saldo (Ingreso de dinero del cliente)
            var movimiento = new MovimientoSaldoCliente
            {
                TenantId = tenantId,
                ClienteId = cliente.Id,
                Monto = p.Monto,
                Tipo = TipoMovimientoSaldo.Ingreso,
                MetodoPagoId = p.MetodoPagoId,
                Descripcion = string.IsNullOrWhiteSpace(p.Notas) ? "Pago recibido a cuenta corriente." : p.Notas
            };

            _context.MovimientosSaldosClientes.Add(movimiento);

            // 2. Actualizar el saldo del cliente
            cliente.SaldoAFavor += p.Monto;

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return movimiento.Id;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
