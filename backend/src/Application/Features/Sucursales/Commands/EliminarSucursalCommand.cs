using Application.Common.Interfaces;
using Core.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Sucursales.Commands;

public record EliminarSucursalCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public class EliminarSucursalHandler : IRequestHandler<EliminarSucursalCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public EliminarSucursalHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(EliminarSucursalCommand request, CancellationToken cancellationToken)
    {
        var sucursal = await _context.Sucursales
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sucursal == null) throw new BusinessException("Sucursal no encontrada.");

        // Validar que no sea la única sucursal
        var total = await _context.Sucursales.CountAsync(cancellationToken);
        if (total <= 1) throw new BusinessException("No puedes eliminar la última sucursal de tu negocio.");

        _context.Sucursales.Remove(sucursal);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
