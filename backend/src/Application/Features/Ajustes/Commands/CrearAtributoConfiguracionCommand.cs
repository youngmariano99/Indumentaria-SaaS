using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Commands;

public class CrearAtributoConfiguracionCommand : IRequest<Guid>
{
    public string Grupo { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}

public class CrearAtributoConfiguracionCommandHandler : IRequestHandler<CrearAtributoConfiguracionCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CrearAtributoConfiguracionCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CrearAtributoConfiguracionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new Exception("No hay tenant activo para crear el atributo.");

        // Verificamos unicidad
        var existe = await _context.AtributosConfiguracion
            .AnyAsync(a => a.TenantId == tenantId && a.Grupo.ToLower() == request.Grupo.ToLower() && a.Valor.ToLower() == request.Valor.ToLower(), cancellationToken);
        
        if (existe)
            throw new Exception("El atributo ya existe en este grupo.");

        var ultimoOrden = await _context.AtributosConfiguracion
            .Where(a => a.TenantId == tenantId && a.Grupo == request.Grupo)
            .MaxAsync(a => (int?)a.Orden, cancellationToken) ?? -1;

        var atributo = new AtributoConfiguracion
        {
            TenantId = tenantId,
            Grupo = request.Grupo,
            Valor = request.Valor,
            Orden = ultimoOrden + 1
        };

        _context.AtributosConfiguracion.Add(atributo);
        await _context.SaveChangesAsync(cancellationToken);

        return atributo.Id;
    }
}
