using Core.Interfaces;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Requiere que el POS o el cajero esté logueado
public class TelemetriaController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public TelemetriaController(ApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    [HttpPost("pwa-ping")]
    public async Task<IActionResult> PwaPing([FromBody] PwaPingRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId;
        if (tenantId == null || tenantId == Guid.Empty) 
            return Unauthorized(new { mensaje = "TenantId no identificado en el token." });

        // Buscar si ya existe el dispositivo registrado para este inquilino
        var dispositivo = await _context.EstadosDispositivosPwa
            .FirstOrDefaultAsync(d => d.DispositivoId == request.DispositivoId, cancellationToken);

        if (dispositivo == null)
        {
            dispositivo = new Core.Entities.EstadoDispositivoPwa
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId.Value,
                DispositivoId = request.DispositivoId,
                NombreDispositivo = request.NombreDispositivo,
                AppVersion = request.AppVersion,
                ItemsPendientesSubida = request.ItemsPendientesSubida,
                UltimaVezOnline = DateTime.UtcNow
            };
            _context.EstadosDispositivosPwa.Add(dispositivo);
        }
        else
        {
            // Actualizar su estado (Update)
            dispositivo.NombreDispositivo = request.NombreDispositivo;
            dispositivo.AppVersion = request.AppVersion;
            dispositivo.ItemsPendientesSubida = request.ItemsPendientesSubida;
            dispositivo.UltimaVezOnline = DateTime.UtcNow;
            _context.EstadosDispositivosPwa.Update(dispositivo);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { success = true, lastPing = dispositivo.UltimaVezOnline });
    }
}

public class PwaPingRequest
{
    public string DispositivoId { get; set; } = string.Empty;
    public string NombreDispositivo { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public int ItemsPendientesSubida { get; set; }
}
