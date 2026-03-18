using Application.DTOs.Sucursales;
using Application.Features.Sucursales.Commands;
using Application.Features.Sucursales.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SucursalesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SucursalesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<SucursalDto>>> GetSucursales()
    {
        var resultado = await _mediator.Send(new ObtenerSucursalesQuery());
        return Ok(resultado);
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<Guid>> PostSucursal([FromBody] CrearSucursalRequest request)
    {
        var id = await _mediator.Send(new CrearSucursalCommand { Payload = request });
        return Ok(id);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> PutSucursal(Guid id, [FromBody] ActualizarSucursalRequest request)
    {
        await _mediator.Send(new ActualizarSucursalCommand { Id = id, Payload = request });
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteSucursal(Guid id)
    {
        await _mediator.Send(new EliminarSucursalCommand { Id = id });
        return NoContent();
    }
}
