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

        cliente.SaldoAFavor += request.Monto;

        var movimiento = new Core.Entities.MovimientoSaldoCliente
        {
            TenantId = _tenantResolver.TenantId ?? Guid.Empty,
            ClienteId = cliente.Id,
            Monto = request.Monto,
            Tipo = Core.Entities.TipoMovimientoSaldo.Ingreso,
            Descripcion = request.Descripcion,
            MetodoPagoId = request.MetodoPagoId
        };

        _context.MovimientosSaldosClientes.Add(movimiento);

        await _context.SaveChangesAsync(cancellationToken);

        return cliente.SaldoAFavor;
    }
}
