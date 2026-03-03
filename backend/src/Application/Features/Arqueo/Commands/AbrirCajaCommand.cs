using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using Application.DTOs.Arqueo;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Arqueo.Commands;

public record AbrirCajaCommand(AbrirCajaDto Payload) : IRequest<Guid>;

public class AbrirCajaCommandHandler : IRequestHandler<AbrirCajaCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public AbrirCajaCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(AbrirCajaCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException();
        var userId = _tenantResolver.UserId ?? throw new UnauthorizedAccessException();

        // Verificar si ya tiene una caja abierta en esa sucursal
        var cajaAbierta = await _context.ArqueosCaja
            .AnyAsync(x => x.UsuarioId == userId && 
                          x.StoreId == request.Payload.StoreId && 
                          x.Estado == EstadoArqueo.Abierto, cancellationToken);

        if (cajaAbierta)
            throw new Exception("Ya tienes una caja abierta en esta sucursal. Debes cerrarla antes de abrir una nueva.");

        var arqueo = new ArqueoCaja
        {
            TenantId = tenantId,
            UsuarioId = userId,
            StoreId = request.Payload.StoreId,
            SaldoInicial = request.Payload.SaldoInicial,
            FechaApertura = DateTime.UtcNow,
            Estado = EstadoArqueo.Abierto
        };

        _context.ArqueosCaja.Add(arqueo);
        await _context.SaveChangesAsync(cancellationToken);

        return arqueo.Id;
    }
}
