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
}
