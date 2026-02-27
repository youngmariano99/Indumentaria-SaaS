using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Ajustes;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Queries;

public class ObtenerConfiguracionAtributosQuery : IRequest<ConfiguracionAtributosDto> { }

public class ObtenerConfiguracionAtributosQueryHandler
    : IRequestHandler<ObtenerConfiguracionAtributosQuery, ConfiguracionAtributosDto>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerConfiguracionAtributosQueryHandler(
        IApplicationDbContext dbContext, ITenantResolver tenantResolver)
    {
        _dbContext = dbContext;
        _tenantResolver = tenantResolver;
    }

    public async Task<ConfiguracionAtributosDto> Handle(
        ObtenerConfiguracionAtributosQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId
            ?? throw new UnauthorizedAccessException("Tenant no identificado.");

        var inquilino = await _dbContext.Inquilinos
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == tenantId, cancellationToken);

        if (inquilino is null)
            return new ConfiguracionAtributosDto { AtributosPorTipo = new() };

        var atributos = JsonSerializer.Deserialize<Dictionary<string, List<AtributoDefaultDto>>>(
            inquilino.ConfiguracionAtributosJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? new();

        return new ConfiguracionAtributosDto { AtributosPorTipo = atributos };
    }
}
