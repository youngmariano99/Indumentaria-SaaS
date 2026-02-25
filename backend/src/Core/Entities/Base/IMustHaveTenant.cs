using System;

namespace Core.Entities.Base;

public interface IMustHaveTenant
{
    Guid TenantId { get; set; }
}
