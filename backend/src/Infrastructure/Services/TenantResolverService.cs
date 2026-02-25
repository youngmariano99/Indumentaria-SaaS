using System;
using Core.Interfaces;

namespace Infrastructure.Services;

public class TenantResolverService : ITenantResolver
{
    private Guid? _tenantId;

    public Guid? TenantId => _tenantId;

    public void SetTenantId(Guid tenantId)
    {
        if (_tenantId.HasValue)
        {
            throw new InvalidOperationException("El TenantId ya fue asignado en esta petición.");
        }
        
        _tenantId = tenantId;
    }
}
