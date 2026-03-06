using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

using Core.Interfaces;

namespace Application.Features.CRM.Commands;

public class AgregarSaldoClienteCommand : IRequest<decimal>
{
    public Guid ClienteId { get; set; }
    public decimal Monto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public Guid? MetodoPagoId { get; set; }
    public Guid? DeudaOrigenId { get; set; }
}

public class AgregarSaldoClienteCommandHandler : IRequestHandler<AgregarSaldoClienteCommand, decimal>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public AgregarSaldoClienteCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<decimal> Handle(AgregarSaldoClienteCommand request, CancellationToken cancellationToken)
    {
        if (request.Monto <= 0)
            throw new ArgumentException("El monto a sumar debe ser mayor a 0.");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.ClienteId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Cliente no encontrado con ID {request.ClienteId}");

        if (string.IsNullOrWhiteSpace(request.Descripcion))
            throw new ArgumentException("Debe proporcionar un motivo para el ajuste de saldo.");

        var deudas = await _context.MovimientosSaldosClientes
            .AsNoTracking()
            .Where(m => m.ClienteId == request.ClienteId && m.Tipo == Core.Entities.TipoMovimientoSaldo.Egreso)
            .Select(m => new { m.Id, m.Monto })
            .ToListAsync(cancellationToken);

        var totalPagadoPorDeuda = await _context.MovimientosSaldosClientes
            .AsNoTracking()
            .Where(m => m.ClienteId == request.ClienteId && m.Tipo == Core.Entities.TipoMovimientoSaldo.Ingreso && m.DeudaOrigenId != null)
            .GroupBy(m => m.DeudaOrigenId!.Value)
            .Select(g => new { DeudaId = g.Key, TotalPagado = g.Sum(x => x.Monto) })
            .ToDictionaryAsync(x => x.DeudaId, x => x.TotalPagado, cancellationToken);

        var hayDeudaPendiente = deudas.Any(d =>
        {
            var pagado = totalPagadoPorDeuda.TryGetValue(d.Id, out var total) ? total : 0m;
            return d.Monto - pagado > 0m;
        });

        if (hayDeudaPendiente && request.DeudaOrigenId == null)
            throw new ArgumentException("Debe asociar el pago a una deuda específica (DeudaOrigenId) mientras existan deudas pendientes.");

        if (request.DeudaOrigenId != null)
        {
            var deuda = deudas.FirstOrDefault(d => d.Id == request.DeudaOrigenId.Value);
            if (deuda == null)
                throw new ArgumentException("La deuda indicada no existe para este cliente.");

            var totalPagado = totalPagadoPorDeuda.TryGetValue(deuda.Id, out var pagado) ? pagado : 0m;
            var pendiente = deuda.Monto - totalPagado;
            if (pendiente <= 0m)
                throw new InvalidOperationException("La deuda indicada ya se encuentra cancelada.");

            if (request.Monto > pendiente)
                throw new InvalidOperationException($"El monto excede el pendiente de la deuda seleccionada. Pendiente actual: {pendiente:0.00}.");
        }

        cliente.SaldoAFavor += request.Monto;

        var movimiento = new Core.Entities.MovimientoSaldoCliente
        {
            TenantId = _tenantResolver.TenantId ?? Guid.Empty,
            ClienteId = cliente.Id,
            Monto = request.Monto,
            Tipo = Core.Entities.TipoMovimientoSaldo.Ingreso,
            Descripcion = request.Descripcion,
            MetodoPagoId = request.MetodoPagoId,
            DeudaOrigenId = request.DeudaOrigenId
        };

        _context.MovimientosSaldosClientes.Add(movimiento);

        await _context.SaveChangesAsync(cancellationToken);

        return cliente.SaldoAFavor;
    }
}
