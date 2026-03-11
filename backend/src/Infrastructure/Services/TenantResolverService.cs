using System;
using Core.Interfaces;

namespace Infrastructure.Services;

public class TenantResolverService : ITenantResolver
{
    private Guid? _tenantId;
    private Guid? _sucursalId;
    private Guid? _userId;
    private Guid? _rubroId;
    private string? _diccionarioJson;

    public Guid? TenantId => _tenantId;
    public Guid? SucursalId => _sucursalId;
    public Guid? UserId => _userId;
    public Guid? RubroId => _rubroId;
    public string? DiccionarioJson => _diccionarioJson;

    public void SetTenantId(Guid tenantId)
    {
        if (_tenantId.HasValue)
        {
            throw new InvalidOperationException("El TenantId ya fue asignado en esta petición.");
        }
        
        _tenantId = tenantId;
    }

    public void SetSucursalId(Guid sucursalId)
    {
        _sucursalId = sucursalId;
    }

    public void SetUserId(Guid userId)
    {
        if (_userId.HasValue)
        {
            throw new InvalidOperationException("El UserId ya fue asignado en esta petición.");
        }

        _userId = userId;
    }

    public void SetRubro(Guid rubroId, string diccionarioJson)
    {
        _rubroId = rubroId;
        _diccionarioJson = diccionarioJson;
    }
}
