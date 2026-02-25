using System;

namespace Core.Interfaces;

public interface ITenantResolver
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
}
