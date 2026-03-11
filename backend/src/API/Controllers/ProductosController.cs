using Application.DTOs.Catalog;
using Application.Features.Catalog.Commands;
using Application.Features.Catalog.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Shared.Interfaces;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido por JWT (Tenant inyectado)
public class ProductosController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IValidadorProducto _validadorProducto;
    private readonly ISchemaRegistry _schemaRegistry;
    private readonly Core.Interfaces.ITenantResolver _tenantResolver;

    public ProductosController(IMediator mediator, IValidadorProducto validadorProducto, ISchemaRegistry schemaRegistry, Core.Interfaces.ITenantResolver tenantResolver)
    {
        _mediator = mediator;
        _validadorProducto = validadorProducto;
        _schemaRegistry = schemaRegistry;
        _tenantResolver = tenantResolver;
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
    /// Retorna el manifiesto (schema) necesario para crear la UI dinámica por Rubro.
    /// GET /api/productos/schema
    /// </summary>
    [HttpGet("schema")]
    public async Task<ActionResult<FormSchemaDto>> GetSchema()
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;
        var result = await _schemaRegistry.ObtenerEsquemaProductoAsync(tenantId);
        return Ok(result);
    }

    /// <summary>
    /// Crea un producto con toda su matriz de variantes en una sola transacción.
    /// POST /api/productos/matrix
    /// </summary>
    [HttpPost("matrix")]
    public async Task<IActionResult> CrearProductoConMatriz([FromBody] CrearProductoDto request)
    {
        var errores = await _validadorProducto.ValidarAsync(request);
        if (errores.Any())
        {
            return BadRequest(new { mensaje = "Errores de validación específicos del rubro", detalles = errores });
        }

        var productId = await _mediator.Send(new CrearProductoConVariantesCommand { Payload = request });
        return CreatedAtAction(nameof(GetProductoById), new { id = productId }, new { id = productId });
    }

    /// <summary>
    /// Crea múltiples productos con sus variantes en un solo lote.
    /// POST /api/productos/batch
    /// </summary>
    [HttpPost("batch")]
    public async Task<IActionResult> CrearProductosBatch([FromBody] List<CrearProductoDto> request)
    {
        var productosCreados = await _mediator.Send(new CrearProductosBatchCommand { Productos = request });
        return Ok(new { Count = productosCreados });
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

    /// <summary>
    /// Edita un producto y sus variantes existentes.
    /// PUT /api/productos/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> EditarProducto(Guid id, [FromBody] EditarProductoDto request)
    {
        var exito = await _mediator.Send(new EditarProductoCommand { ProductoId = id, Payload = request });
        if (!exito) return NotFound("Producto no encontrado o inaccesible.");
        return NoContent(); // 204 No Content
    }

    /// <summary>
    /// Aplica una baja lógica a un producto y sus variantes.
    /// DELETE /api/productos/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarProducto(Guid id)
    {
        var exito = await _mediator.Send(new EliminarProductoCommand { ProductoId = id });
        if (!exito) return NotFound("Producto no encontrado o inaccesible.");
        return NoContent(); // 204 No Content
    }
}
