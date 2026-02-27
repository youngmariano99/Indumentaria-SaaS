using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Ajustes;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Queries;

public class ObtenerConfiguracionTallesQuery : IRequest<ConfiguracionTallesDto> { }

public class ObtenerConfiguracionTallesQueryHandler
    : IRequestHandler<ObtenerConfiguracionTallesQuery, ConfiguracionTallesDto>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly Core.Interfaces.ITenantResolver _tenantResolver;

    public ObtenerConfiguracionTallesQueryHandler(
        IApplicationDbContext dbContext,
        Core.Interfaces.ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task<ConfiguracionTallesDto> Handle(
        ObtenerConfiguracionTallesQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId
            ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        var inquilino = await _dbContext.Inquilinos
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == tenantId, cancellationToken);

        if (inquilino is null)
            return new ConfiguracionTallesDto { TallesPorTipo = new() };

        var talles = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(
            inquilino.ConfiguracionTallesJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? new Dictionary<string, List<string>>();

        return new ConfiguracionTallesDto { TallesPorTipo = talles };
    }
}
