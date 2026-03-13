using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Core.Interfaces;

namespace API.Middleware;

/// <summary>
/// Middleware que inyecta el diccionario del rubro actual en los encabezados de respuesta.
/// Permite que el Frontend (React) se adapte dinámicamente sin peticiones extra.
/// </summary>
public class DiccionarioRubroMiddleware
{
    private readonly RequestDelegate _next;

    public DiccionarioRubroMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantResolver tenantResolver)
    {
        // Si hay un diccionario cargado para el inquilino local, lo exponemos
        if (tenantResolver.RubroId.HasValue && !string.IsNullOrEmpty(tenantResolver.DiccionarioJson))
        {
            context.Response.Headers.Append("X-Rubro-Id", tenantResolver.RubroId.Value.ToString());
            
            if (!string.IsNullOrEmpty(tenantResolver.RubroSlug))
            {
                context.Response.Headers.Append("X-Rubro-Slug", tenantResolver.RubroSlug);
            }

            // Codificamos en Base64 para evitar problemas con caracteres especiales (acentos) en los headers HTTP.
            var jsonBytes = System.Text.Encoding.UTF8.GetBytes(tenantResolver.DiccionarioJson);
            var base64Manifest = System.Convert.ToBase64String(jsonBytes);
            context.Response.Headers.Append("X-Rubro-Manifest", base64Manifest);
        }

        await _next(context);
    }
}
