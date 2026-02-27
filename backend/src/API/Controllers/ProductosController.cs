using Application.DTOs.Catalog;
using Application.Features.Catalog.Commands;
using Application.Features.Catalog.Queries;
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

    /// <summary>
    /// Lista todos los productos del tenant con sus variantes (talle/color).
    /// GET /api/productos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProductoConVariantesDto>>> GetCatalogo()
    {
        var resultado = await _mediator.Send(new ObtenerCatalogoQuery());
        return Ok(resultado);
    }

    /// <summary>
    /// Crea un producto con toda su matriz de variantes en una sola transacción.
    /// POST /api/productos/matrix
    /// </summary>
    [HttpPost("matrix")]
    public async Task<IActionResult> CrearProductoConMatriz([FromBody] CrearProductoDto request)
    {
        var productId = await _mediator.Send(new CrearProductoConVariantesCommand { Payload = request });
        return CreatedAtAction(nameof(GetProductoById), new { id = productId }, new { id = productId });
    }

    /// <summary>
    /// Obtiene un producto por ID (para usar como ruta de CreatedAtAction).
    /// GET /api/productos/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductoById(Guid id)
    {
        var resultado = await _mediator.Send(new ObtenerCatalogoQuery());
        var producto = resultado.FirstOrDefault(p => p.Id == id);
        if (producto is null) return NotFound();
        return Ok(producto);
    }
}
