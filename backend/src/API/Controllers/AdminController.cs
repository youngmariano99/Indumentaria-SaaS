using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")] // Protección estricta: Solo el rol SuperAdmin
public class AdminController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminController(IApplicationDbContext context)
    {
        _context = context;
        // 🚨 CRÍTICO: Apagamos el firewall de aislamiento de Tenant
        // Esto permite que el _context vea los datos de TODAS las tiendas.
        _context.EnterBypassMode();
    }

    [HttpGet("tenants")]
    public async Task<IActionResult> GetTenants(CancellationToken cancellationToken)
    {
        // Al aplicar EnterBypassMode, esta consulta traerá realmente
        // todos los inquilinos de la base de datos, ignorando a qué Tenant
        // pertenece el JWT del usuario SuperAdmin que hizo la petición.
        var tenants = await _context.Inquilinos
            .AsNoTracking()
            .OrderByDescending(t => t.FechaCreacion)
            .Select(t => new
            {
                t.Id,
                Nombre = t.NombreComercial,
                EmpresaRazonSocial = t.CUIT, // Por ahora enviamos el cuit aquí
                t.Subdominio,
                Plan = "SaaS Básico", // Hardcodeado por ahora
                Activo = true, // Hardcodeado por ahora
                t.FechaCreacion
            })
            .ToListAsync(cancellationToken);

        return Ok(tenants);
    }
}
