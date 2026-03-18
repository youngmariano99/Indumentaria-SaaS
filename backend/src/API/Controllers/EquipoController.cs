using Application.DTOs.Equipo;
using Application.Features.Equipo.Commands;
using Application.Features.Equipo.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class EquipoController : ControllerBase
{
    private readonly IMediator _mediator;

    public EquipoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<List<ColaboradorDto>>> GetEquipo()
    {
        var resultado = await _mediator.Send(new ObtenerEquipoQuery());
        return Ok(resultado);
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<Guid>> PostColaborador([FromBody] CrearColaboradorRequest request)
    {
        var id = await _mediator.Send(new CrearColaboradorCommand { Payload = request });
        return Ok(id);
    }

    [HttpPut("{id:guid}/permisos")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> PutPermisos(Guid id, [FromBody] ActualizarPermisosRequest request)
    {
        await _mediator.Send(new ActualizarPermisosColaboradorCommand 
        { 
            UsuarioId = id, 
            Permisos = request.Permisos 
        });
        return NoContent();
    }

    [HttpPut("{id:guid}/pin")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> ActualizarPin(Guid id, [FromBody] string pin)
    {
        await _mediator.Send(new CambiarPinCommand { UsuarioId = id, NuevoPin = pin });
        return NoContent();
    }

    [HttpPost("acceso-rapido")]
    [Authorize] // Cualquier usuario logueado en el tenant puede intentar cambiar a otro mediante PIN
    public async Task<ActionResult<Application.DTOs.Auth.LoginResponse>> AccesoRapido([FromBody] string pin)
    {
        var respuesta = await _mediator.Send(new AutenticarPinCommand { Pin = pin });
        return Ok(respuesta);
    }

    [HttpGet("auditoria")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<List<LogAuditoriaDto>>> GetAuditoria()
    {
        var resultado = await _mediator.Send(new ObtenerAuditoriaQuery());
        return Ok(resultado);
    }
}
