using Application.DTOs.Ajustes;
using Application.Features.Ajustes.Commands;
using Application.Features.Ajustes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AjustesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AjustesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Obtiene la configuración de talles personalizada del tenant.
    /// Si nunca configuró, devuelve un diccionario vacío
    /// (el frontend usará los defaults de tallesPorTipo.ts).
    /// GET /api/ajustes/talles
    /// </summary>
    [HttpGet("talles")]
    public async Task<ActionResult<ConfiguracionTallesDto>> GetTalles()
    {
        var resultado = await _mediator.Send(new ObtenerConfiguracionTallesQuery());
        return Ok(resultado);
    }

    /// <summary>Guarda la configuración de talles personalizada del tenant. PUT /api/ajustes/talles</summary>
    [HttpPut("talles")]
    public async Task<IActionResult> PutTalles([FromBody] ConfiguracionTallesDto dto)
    {
        await _mediator.Send(new ActualizarConfiguracionTallesCommand { Payload = dto });
        return NoContent();
    }

    /// <summary>
    /// Obtiene los atributos predefinidos por tipo de producto del tenant.
    /// GET /api/ajustes/atributos
    /// </summary>
    [HttpGet("atributos")]
    public async Task<ActionResult<ConfiguracionAtributosDto>> GetAtributos()
    {
        var resultado = await _mediator.Send(new ObtenerConfiguracionAtributosQuery());
        return Ok(resultado);
    }

    /// <summary>
    /// Guarda los atributos predefinidos por tipo del tenant.
    /// PUT /api/ajustes/atributos
    /// </summary>
    [HttpPut("atributos")]
    public async Task<IActionResult> PutAtributos([FromBody] ConfiguracionAtributosDto dto)
    {
        await _mediator.Send(new ActualizarConfiguracionAtributosCommand { Payload = dto });
        return NoContent();
    }

    /// <summary>
    /// Obtiene el diccionario base de configuración de metadatos (Ferretería).
    /// GET /api/ajustes/diccionario?grupo=Medida
    /// </summary>
    [HttpGet("diccionario")]
    public async Task<ActionResult<List<AtributoConfiguracionDto>>> GetDiccionario([FromQuery] string? grupo)
    {
        var resultado = await _mediator.Send(new ObtenerAtributosConfiguracionQuery { Grupo = grupo });
        return Ok(resultado);
    }

    /// <summary>
    /// Crea un nuevo valor en el diccionario base (Optimistic UI fallback).
    /// POST /api/ajustes/diccionario
    /// </summary>
    [HttpPost("diccionario")]
    public async Task<ActionResult<Guid>> PostDiccionario([FromBody] CrearAtributoConfiguracionCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(id);
    }

    /// <summary>
    /// Elimina de forma lógica un valor del diccionario (Soft Delete).
    /// DELETE /api/ajustes/diccionario/{id}
    /// </summary>
    [HttpDelete("diccionario/{id:guid}")]
    public async Task<IActionResult> DeleteDiccionario(Guid id)
    {
        await _mediator.Send(new EliminarAtributoConfiguracionCommand { Id = id });
        return NoContent();
    }
}
