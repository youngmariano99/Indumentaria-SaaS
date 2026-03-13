using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class RubrosController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public RubrosController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetRubros()
    {
        var rubros = await _dbContext.Rubros
            .Where(r => r.Activo)
            .Select(r => new { r.Id, r.Nombre, r.Slug, r.Icono })
            .ToListAsync();
        return Ok(rubros);
    }
}
