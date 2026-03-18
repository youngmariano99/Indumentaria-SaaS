using Application.Common.Interfaces;
using Application.DTOs.Sucursales;
using Core.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Sucursales.Commands;

public record ActualizarSucursalCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public ActualizarSucursalRequest Payload { get; init; } = null!;
}

public class ActualizarSucursalHandler : IRequestHandler<ActualizarSucursalCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public ActualizarSucursalHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(ActualizarSucursalCommand request, CancellationToken cancellationToken)
    {
        var sucursal = await _context.Sucursales
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sucursal == null) throw new BusinessException("Sucursal no encontrada.");

        sucursal.Nombre = request.Payload.Nombre;
        sucursal.Direccion = request.Payload.Direccion;
        sucursal.Telefono = request.Payload.Telefono;
        sucursal.EsDepositoCentral = request.Payload.EsDepositoCentral;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
