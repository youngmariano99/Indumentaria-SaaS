using Application.DTOs.Catalog;
using Application.Features.Catalog.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido por JWT (Tenant inyectado)
public class ProductosController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("matrix")]
    public async Task<IActionResult> CrearProductoConMatriz([FromBody] CrearProductoDto request)
    {
        var productId = await _mediator.Send(new CrearProductoConVariantesCommand { Payload = request });
        return CreatedAtAction(nameof(GetProductoById), new { id = productId }, new { id = productId });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductoById(Guid id)
    {
        // Placeholder para futuras consultas (Query CQRS)
        return Ok(new { id });
    }
}
