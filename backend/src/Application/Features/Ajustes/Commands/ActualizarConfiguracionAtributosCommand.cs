using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Ajustes;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Commands;

public class ActualizarConfiguracionAtributosCommand : IRequest
{
    public ConfiguracionAtributosDto Payload { get; set; } = new();
}

public class ActualizarConfiguracionAtributosCommandHandler
    : IRequestHandler<ActualizarConfiguracionAtributosCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public ActualizarConfiguracionAtributosCommandHandler(
        IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task Handle(
        ActualizarConfiguracionAtributosCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId
            ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Id == tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Inquilino no encontrado.");

        inquilino.ConfiguracionAtributosJson = JsonSerializer.Serialize(
            request.Payload.AtributosPorTipo);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
