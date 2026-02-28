using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public class EliminarClienteCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}

public class EliminarClienteCommandHandler : IRequestHandler<EliminarClienteCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public EliminarClienteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(EliminarClienteCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"No se encontró el cliente con ID {request.Id}.");

        // Soft Delete (Para preservar facturación histórica vinculada)
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
