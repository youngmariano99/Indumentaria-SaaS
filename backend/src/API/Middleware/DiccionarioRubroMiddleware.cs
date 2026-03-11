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
            
            // Base64 encoding para evitar problemas con caracteres especiales en el header si fuera necesario,
            // pero por simplicidad y tamaño enviamos el JSON directo si es corto.
            context.Response.Headers.Append("X-Rubro-Manifest", tenantResolver.DiccionarioJson);
        }

        await _next(context);
    }
}
