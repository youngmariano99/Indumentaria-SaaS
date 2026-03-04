using Application.DTOs.Arqueo;
using Application.Features.Arqueo.Commands;
using Application.Features.Arqueo.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ArqueoCajaController : ControllerBase
{
    private readonly IMediator _mediator;

    public ArqueoCajaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("actual/{storeId}")]
    public async Task<ActionResult<ArqueoDto>> GetActual(Guid storeId)
    {
        var result = await _mediator.Send(new ObtenerArqueoActualQuery(storeId));
        if (result == null) return NotFound("No hay una caja abierta para esta sucursal.");
        return Ok(result);
    }

    [HttpPost("abrir")]
    public async Task<ActionResult<Guid>> Abrir(AbrirCajaDto payload)
    {
        return Ok(await _mediator.Send(new AbrirCajaCommand(payload)));
    }

    [HttpPost("cerrar/{id}")]
    public async Task<ActionResult<bool>> Cerrar(Guid id, CerrarCajaDto payload)
    {
        return Ok(await _mediator.Send(new CerrarCajaCommand(id, payload)));
    }

    [HttpGet("historial/{storeId}")]
    public async Task<ActionResult<List<ArqueoDto>>> GetHistorial(Guid storeId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await _mediator.Send(new ObtenerHistorialArqueosQuery(storeId, page, pageSize)));
    }
}
