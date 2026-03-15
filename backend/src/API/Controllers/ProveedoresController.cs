using Application.Features.Providers.Commands.CreateProveedor;
using Application.Features.Providers.Commands.RecordFacturaProveedor;
using Application.Features.Providers.Queries.GetProveedores;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProveedoresController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProveedoresController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? search)
    {
        var result = await _mediator.Send(new GetProveedoresQuery { Search = search });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProveedorCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("factura")]
    public async Task<IActionResult> RecordFactura([FromBody] RecordFacturaProveedorCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new { id = result });
    }

    [HttpPost("{id}/update-costs")]
    public async Task<IActionResult> UpdateCosts(Guid id, [FromBody] decimal percentage)
    {
        var result = await _mediator.Send(new UpdateCostosProveedorCommand { ProveedorId = id, PorcentajeAumento = percentage });
        return Ok(new { success = result });
    }
}
