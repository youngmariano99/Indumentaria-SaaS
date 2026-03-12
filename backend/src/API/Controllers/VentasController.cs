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

    [HttpGet("buscar")]
    public async Task<IActionResult> BuscarProductosPos([FromQuery] string t)
    {
        var result = await _mediator.Send(new BuscarProductosPosQuery(t));
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

    [HttpPost("devolucion")]
    public async Task<IActionResult> ProcesarDevolucion([FromBody] DevolucionDto payload)
    {
        var devolucionId = await _mediator.Send(new CrearDevolucionCommand(payload));
        return Ok(new { DevolucionId = devolucionId, Mensaje = "Devolución y/o Cambio registrado correctamente. El saldo del cliente ha sido actualizado." });
    }

    [HttpPost("pagar-deuda")]
    public async Task<IActionResult> RegistrarPago([FromBody] RegistrarPagoDto payload)
    {
        var movimientoId = await _mediator.Send(new RegistrarPagoCuentaCorrienteCommand(payload));
        return Ok(new { MovimientoId = movimientoId, Mensaje = "Pago registrado con éxito. El saldo del cliente ha sido actualizado." });
    }

    [HttpGet("ticket/{identificador}")]
    public async Task<IActionResult> GetVentaByIdentificador(string identificador)
    {
        var result = await _mediator.Send(new ObtenerVentaPorIdentificadorQuery(identificador));
        if (result == null) return NotFound("Ticket no encontrado.");
        return Ok(result);
    }

    [HttpGet("cliente/{clienteId:guid}/cuenta-corriente")]
    public async Task<IActionResult> GetCuentaCorriente(Guid clienteId)
    {
        var result = await _mediator.Send(new ObtenerMovimientosCuentaCorrienteQuery(clienteId));
        return Ok(result);
    }
}
