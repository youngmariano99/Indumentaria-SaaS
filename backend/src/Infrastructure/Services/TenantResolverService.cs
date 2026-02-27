using System;
using Core.Interfaces;

namespace Infrastructure.Services;

public class TenantResolverService : ITenantResolver
{
    private Guid? _tenantId;
    private Guid? _userId;

    public Guid? TenantId => _tenantId;
    public Guid? UserId => _userId;

    public void SetTenantId(Guid tenantId)
    {
        if (_tenantId.HasValue)
        {
            throw new InvalidOperationException("El TenantId ya fue asignado en esta petición.");
        }
        
        _tenantId = tenantId;
    }

    public void SetUserId(Guid userId)
    {
        if (_userId.HasValue)
        {
            throw new InvalidOperationException("El UserId ya fue asignado en esta petición.");
        }

        _userId = userId;
    }
}
