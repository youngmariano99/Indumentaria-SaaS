using Application.DTOs.Catalog;
using Application.Features.Catalog.Commands;
using Application.Features.Catalog.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoriaDto>>> GetCategorias()
    {
        var result = await _mediator.Send(new ObtenerCategoriasQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CrearCategoria(CrearCategoriaDto dto)
    {
        var id = await _mediator.Send(new CrearCategoriaCommand { Payload = dto });
        return Ok(new { Id = id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditarCategoria(Guid id, EditarCategoriaDto dto)
    {
        var result = await _mediator.Send(new EditarCategoriaCommand { CategoriaId = id, Payload = dto });
        if (!result) return NotFound(new { Mensaje = "Categoría no encontrada." });
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarCategoria(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new EliminarCategoriaCommand { CategoriaId = id });
            if (!result) return NotFound(new { Mensaje = "Categoría no encontrada." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Mensaje = ex.Message });
        }
    }
}
