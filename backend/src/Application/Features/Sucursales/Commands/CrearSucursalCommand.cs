using Application.Common.Interfaces;
using Application.DTOs.Sucursales;
using Core.Entities;
using Core.Interfaces;
using Core.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Sucursales.Commands;

public record CrearSucursalCommand : IRequest<Guid>
{
    public CrearSucursalRequest Payload { get; init; } = null!;
}

public class CrearSucursalHandler : IRequestHandler<CrearSucursalCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IFeatureResolver _featureResolver;
    private readonly ITenantResolver _tenantResolver;

    public CrearSucursalHandler(IApplicationDbContext context, IFeatureResolver featureResolver, ITenantResolver tenantResolver)
    {
        _context = context;
        _featureResolver = featureResolver;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CrearSucursalCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId;
        if (!tenantId.HasValue) throw new BusinessException("Contexto de negocio no identificado.");

        // Validar límite de sucursales
        var sucursalesExistentes = await _context.Sucursales.CountAsync(cancellationToken);
        
        if (sucursalesExistentes >= 1)
        {
            var multiSucursalHabilitado = await _featureResolver.IsEnabledAsync("Multisucursal");
            if (!multiSucursalHabilitado)
            {
                throw new BusinessException("Tu plan actual solo permite 1 sucursal. Por favor, realiza un upgrade para gestionar múltiples sedes.");
            }
        }

        var sucursal = new Sucursal
        {
            Nombre = request.Payload.Nombre,
            Direccion = request.Payload.Direccion,
            Telefono = request.Payload.Telefono,
            EsDepositoCentral = request.Payload.EsDepositoCentral,
            TenantId = tenantId.Value
        };

        _context.Sucursales.Add(sucursal);
        await _context.SaveChangesAsync(cancellationToken);

        return sucursal.Id;
    }
}
