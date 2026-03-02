using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Catalog;
using Application.Features.Catalog.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/catalogoasistido")]
[Authorize]
public class CatalogoAsistidoController : ControllerBase
{
    private readonly IMediator _mediator;

    public CatalogoAsistidoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Devuelve los productos con stock total mayor a 0 y menor al umbral indicado (por defecto 7).
    /// </summary>
    [HttpGet("stock-bajo")]
    public async Task<ActionResult<List<ProductoStockResumenDto>>> GetStockBajo([FromQuery] int umbral = 7)
    {
        var result = await _mediator.Send(new ObtenerProductosStockBajoQuery(umbral));
        return Ok(result);
    }

    /// <summary>
    /// Devuelve los productos cuyo stock total es 0.
    /// </summary>
    [HttpGet("sin-stock")]
    public async Task<ActionResult<List<ProductoStockResumenDto>>> GetSinStock()
    {
        var result = await _mediator.Send(new ObtenerProductosSinStockQuery());
        return Ok(result);
    }

    /// <summary>
    /// Devuelve los productos más vendidos de la última semana (top 3 por defecto).
    /// </summary>
    [HttpGet("top-vendidos-semana")]
    public async Task<ActionResult<List<ProductoVentaSemanaDto>>> GetTopVendidosSemana([FromQuery] int topN = 3)
    {
        var result = await _mediator.Send(new ObtenerTopProductosSemanaQuery(topN));
        return Ok(result);
    }
}

