using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Ajustes;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Commands;

public class ActualizarConfiguracionTallesCommand : IRequest
{
    public ConfiguracionTallesDto Payload { get; set; } = new();
}

public class ActualizarConfiguracionTallesCommandHandler
    : IRequestHandler<ActualizarConfiguracionTallesCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public ActualizarConfiguracionTallesCommandHandler(
        IApplicationDbContext dbContext,
        ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task Handle(
        ActualizarConfiguracionTallesCommand request,
        CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId
            ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        // Necesitamos IgnoreQueryFilters porque Inquilino no implementa IMustHaveTenant
        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Id == tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Inquilino no encontrado.");

        inquilino.ConfiguracionTallesJson = JsonSerializer.Serialize(
            request.Payload.TallesPorTipo);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
