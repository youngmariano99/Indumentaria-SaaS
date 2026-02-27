using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Core.Interfaces;

namespace API.Middleware;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolverMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantResolver tenantResolver)
    {
        // 1. Intentamos leer el TenantId directamente desde los Claims del JWT (Prioridad principal)
        var tenantClaim = context.User.FindFirst("tenantid")?.Value;

        if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantIdFromClaim))
        {
            tenantResolver.SetTenantId(tenantIdFromClaim);
        }

        var userClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userClaim) && Guid.TryParse(userClaim, out var userIdFromClaim))
        {
            tenantResolver.SetUserId(userIdFromClaim);
        }
        else

        {
            // 2. Fallback temporal por si se sigue usando Swagger o endpoints sin Auth que envían el Header
            var tenantHeader = context.Request.Headers["X-Tenant-Id"].ToString();
            if (!string.IsNullOrEmpty(tenantHeader) && Guid.TryParse(tenantHeader, out var tenantIdFromHeader))
            {
                tenantResolver.SetTenantId(tenantIdFromHeader);
            }
        }

        await _next(context);
    }
}
