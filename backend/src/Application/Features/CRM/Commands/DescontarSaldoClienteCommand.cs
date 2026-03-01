using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public class DescontarSaldoClienteCommand : IRequest<decimal>
{
    public Guid ClienteId { get; set; }
    public decimal Monto { get; set; }
}

public class DescontarSaldoClienteCommandHandler : IRequestHandler<DescontarSaldoClienteCommand, decimal>
{
    private readonly IApplicationDbContext _context;

    public DescontarSaldoClienteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> Handle(DescontarSaldoClienteCommand request, CancellationToken cancellationToken)
    {
        if (request.Monto <= 0)
            throw new ArgumentException("El monto a descontar debe ser mayor a 0.");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.ClienteId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Cliente no encontrado con ID {request.ClienteId}");

        if (cliente.SaldoAFavor < request.Monto)
            throw new InvalidOperationException($"Saldo insuficiente. Saldo actual: ${cliente.SaldoAFavor}");

        cliente.SaldoAFavor -= request.Monto;

        await _context.SaveChangesAsync(cancellationToken);

        return cliente.SaldoAFavor;
    }
}
