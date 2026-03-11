using Microsoft.AspNetCore.Mvc;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeaturesController : ControllerBase
{
    private readonly IFeatureResolver _featureResolver;

    public FeaturesController(IFeatureResolver featureResolver)
    {
        _featureResolver = featureResolver;
    }

    /// <summary>
    /// Obtiene todas las features activas para el contexto del usuario actual.
    /// Jerarquía: Usuario > Sucursal > Inquilino > Rubro.
    /// </summary>
    [HttpGet("my-features")]
    public async Task<ActionResult<Dictionary<string, bool>>> GetMyFeatures()
    {
        var features = await _featureResolver.GetAllEnabledAsync();
        return Ok(features);
    }
    
    /// <summary>
    /// Verifica si una feature específica está activa.
    /// </summary>
    [HttpGet("check/{featureKey}")]
    public async Task<ActionResult<bool>> CheckFeature(string featureKey)
    {
        var isEnabled = await _featureResolver.IsEnabledAsync(featureKey);
        return Ok(isEnabled);
    }
}
