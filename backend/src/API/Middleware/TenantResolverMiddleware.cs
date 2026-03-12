using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Application.Common.Interfaces;

namespace API.Middleware;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolverMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantResolver tenantResolver, IApplicationDbContext dbContext)
    {
        Guid? tenantId = null;

        // 1. Intentamos leer el TenantId directamente desde los Claims del JWT
        var tenantClaim = context.User.FindFirst("tenantid")?.Value;
        if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantIdFromClaim))
        {
            tenantId = tenantIdFromClaim;
        }
        else 
        {
            // 2. Fallback por Header
            var tenantHeader = context.Request.Headers["X-Tenant-Id"].ToString();
            if (!string.IsNullOrEmpty(tenantHeader) && Guid.TryParse(tenantHeader, out var tenantIdFromHeader))
            {
                tenantId = tenantIdFromHeader;
            }
        }

        if (tenantId.HasValue)
        {
            tenantResolver.SetTenantId(tenantId.Value);

            // Cargar información del Rubro para el motor de localización dinámico
            var inquilino = await dbContext.Inquilinos
                .Include(i => i.Rubro)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == tenantId.Value);

            if (inquilino?.Rubro != null)
            {
                tenantResolver.SetRubro(inquilino.RubroId, inquilino.Rubro.Slug, inquilino.Rubro.DiccionarioJson);
            }
        }

        var userClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userClaim) && Guid.TryParse(userClaim, out var userIdFromClaim))
        {
            tenantResolver.SetUserId(userIdFromClaim);
        }

        // 3. Contexto de Sucursal
        var sucursalHeader = context.Request.Headers["X-Sucursal-Id"].ToString();
        if (!string.IsNullOrEmpty(sucursalHeader) && Guid.TryParse(sucursalHeader, out var sucursalIdFromHeader))
        {
            tenantResolver.SetSucursalId(sucursalIdFromHeader);
        }

        await _next(context);
    }
}
