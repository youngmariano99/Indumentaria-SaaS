using Application.Features.CRM.Commands;
using Application.Features.CRM.DTOs;
using Application.Features.CRM.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClienteDto>>> GetClientes()
    {
        var result = await _mediator.Send(new ObtenerClientesQuery());
        return Ok(result);
    }

    [HttpGet("{id}/perfil-360")]
    public async Task<ActionResult<Cliente360Dto>> GetCliente360(Guid id)
    {
        var result = await _mediator.Send(new ObtenerCliente360Query { ClienteId = id });
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> CrearCliente([FromBody] CrearClienteDto dto)
    {
        var result = await _mediator.Send(new CrearClienteCommand { Cliente = dto });
        return CreatedAtAction(nameof(GetClientes), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClienteDto>> EditarCliente(Guid id, [FromBody] EditarClienteDto dto)
    {
        if (id != dto.Id) return BadRequest("El ID de la ruta no coincide con el ID del cuerpo");

        var result = await _mediator.Send(new EditarClienteCommand { Cliente = dto });
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> EliminarCliente(Guid id)
    {
        await _mediator.Send(new EliminarClienteCommand { Id = id });
        return NoContent();
    }

    [HttpPost("{id}/saldo/sumar")]
    public async Task<ActionResult<decimal>> AgregarSaldo(Guid id, [FromBody] decimal monto)
    {
        var result = await _mediator.Send(new AgregarSaldoClienteCommand { ClienteId = id, Monto = monto });
        return Ok(result);
    }

    [HttpPost("{id}/saldo/restar")]
    public async Task<ActionResult<decimal>> DescontarSaldo(Guid id, [FromBody] decimal monto)
    {
        var result = await _mediator.Send(new DescontarSaldoClienteCommand { ClienteId = id, Monto = monto });
        return Ok(result);
    }
}
