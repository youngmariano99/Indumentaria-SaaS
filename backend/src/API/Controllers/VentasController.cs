using Application.DTOs.Ventas;
using Application.Features.Ventas.Commands;
using Application.Features.Ventas.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly IMediator _mediator;

    public VentasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pos-grid")]
    public async Task<IActionResult> ObtenerCatalogoPos()
    {
        var result = await _mediator.Send(new ObtenerCatálogoParaPosQuery());
        return Ok(result);
    }

    [HttpGet("metodos-pago")]
    public async Task<IActionResult> ObtenerMetodosPago()
    {
        var result = await _mediator.Send(new ObtenerMetodosPagoQuery());
        return Ok(result);
    }

    [HttpPost("cobrar")]
    public async Task<IActionResult> ProcesarTicketDeCaja([FromBody] CobrarTicketDto payload)
    {
        var ticketGeneradoId = await _mediator.Send(new CobrarTicketCommand(payload));
        
        // Retornamos 201 Created con información del Ticket
        return Created("", new { VentaId = ticketGeneradoId, Mensaje = "Venta procesada con éxito y stock detraído automáticamnente." });
    }
}
