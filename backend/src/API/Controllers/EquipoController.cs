using Application.DTOs.Equipo;
using Application.Features.Equipo.Commands;
using Application.Features.Equipo.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Owner")] // Solo el dueño puede gestionar el equipo
public class EquipoController : ControllerBase
{
    private readonly IMediator _mediator;

    public EquipoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ColaboradorDto>>> GetEquipo()
    {
        var resultado = await _mediator.Send(new ObtenerEquipoQuery());
        return Ok(resultado);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> PostColaborador([FromBody] CrearColaboradorRequest request)
    {
        var id = await _mediator.Send(new CrearColaboradorCommand { Payload = request });
        return Ok(id);
    }

    [HttpPut("{id:guid}/permisos")]
    public async Task<IActionResult> PutPermisos(Guid id, [FromBody] ActualizarPermisosRequest request)
    {
        await _mediator.Send(new ActualizarPermisosColaboradorCommand 
        { 
            UsuarioId = id, 
            Permisos = request.Permisos 
        });
        return NoContent();
    }
}
