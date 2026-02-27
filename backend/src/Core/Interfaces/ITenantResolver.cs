using System;

namespace Core.Interfaces;

public interface ITenantResolver
{
    Guid? TenantId { get; }
    Guid? UserId { get; }
    void SetTenantId(Guid tenantId);
    void SetUserId(Guid userId);
}
