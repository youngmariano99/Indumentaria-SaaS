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
        // 1. Intentamos leer el header temporal pactado para el Sprint 2
        var tenantHeader = context.Request.Headers["X-Tenant-Id"].ToString();

        // Si existe y es un Guid válido, lo seteamos en el resolver de la petición actual (Scope)
        if (!string.IsNullOrEmpty(tenantHeader) && Guid.TryParse(tenantHeader, out var tenantId))
        {
            tenantResolver.SetTenantId(tenantId);
        }

        // Importante: El Sprint 4 de Refactor JWT deberá reemplazar esta sección para
        // leer el tenantId directamente desde los Claims:
        // var claim = context.User.FindFirst("tenant_id");

        await _next(context);
    }
}
