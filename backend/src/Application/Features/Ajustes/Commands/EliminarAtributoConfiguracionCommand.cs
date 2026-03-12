using Application.Common.Interfaces;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Commands;

public class EliminarAtributoConfiguracionCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class EliminarAtributoConfiguracionCommandHandler : IRequestHandler<EliminarAtributoConfiguracionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public EliminarAtributoConfiguracionCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<bool> Handle(EliminarAtributoConfiguracionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new Exception("No hay tenant activo.");

        var atributo = await _context.AtributosConfiguracion
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == tenantId, cancellationToken);

        if (atributo == null)
            throw new Exception("Atributo no encontrado.");

        // Por ahora aplicamos un borrado lógico simple
        atributo.IsDeleted = true;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
