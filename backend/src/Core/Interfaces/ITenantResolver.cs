using System;

namespace Core.Interfaces;

public interface ITenantResolver
{
    Guid? TenantId { get; }
    Guid? SucursalId { get; }
    Guid? UserId { get; }
    Guid? RubroId { get; }
    string? DiccionarioJson { get; }
    void SetTenantId(Guid tenantId);
    void SetSucursalId(Guid sucursalId);
    void SetUserId(Guid userId);
    void SetRubro(Guid rubroId, string diccionarioJson);
}
