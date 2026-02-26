using Application.DTOs.Auth;
using Core.Interfaces.Auth;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly FluentValidation.IValidator<LoginRequest> _validator;

    public AuthController(
        ApplicationDbContext dbContext, 
        IPasswordHasher passwordHasher, 
        IJwtTokenGenerator jwtTokenGenerator,
        FluentValidation.IValidator<LoginRequest> validator)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _validator = validator;
    }

    [HttpPost("login")]
    [AllowAnonymous] // El login es público
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => new { Propiedad = e.PropertyName, Error = e.ErrorMessage });
            return BadRequest(new { mensaje = "Errores de validación", detalles = errors });
        }

        // 1. Buscamos al Inquilino por su subdominio (ej: "zara" en zara.tusaas.com)
        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Subdominio == request.Subdominio);

        if (inquilino == null)
        {
            return Unauthorized(new { mensaje = "Subdominio no encontrado" });
        }

        // 2. Buscamos al usuario por Email, pero EXCLUSIVAMENTE dentro de ese Inquilino
        // Usamos IgnoreQueryFilters porque el TenantResolver middleware aún no tiene el TenantId
        var usuario = await _dbContext.Set<Core.Entities.Usuario>()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.TenantId == inquilino.Id);

        // 3. Si no existe o la contraseña no coincide, devolvemos 401
        if (usuario == null || !_passwordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            return Unauthorized(new { mensaje = "Credenciales inválidas" });
        }

        // 3. Generamos el JWT que incluirá su TenantId y Rol en los Claims
        var token = _jwtTokenGenerator.GenerateToken(usuario);

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = usuario.Id,
            Nombre = usuario.Nombre,
            TenantId = usuario.TenantId,
            Rol = usuario.Rol
        });
    }

    // Método temporal para facilitar la carga de un usuario administrador inicial
    // para un tenant específico, para poder probar el flujo.
    [HttpPost("register-admin-temp")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterAdminTemp([FromBody] LoginRequest request)
    {
        // Temporal: Crear inquilino si no existe ese subdominio
        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Subdominio == request.Subdominio);

        if (inquilino == null)
        {
            inquilino = new Core.Entities.Inquilino 
            { 
                Id = Guid.NewGuid(), 
                NombreComercial = "Tienda " + request.Subdominio,
                Subdominio = request.Subdominio 
            };
            _dbContext.Inquilinos.Add(inquilino);
        }

        var passwordHash = _passwordHasher.Hash(request.Password);
        
        var newUser = new Core.Entities.Usuario
        {
            Id = Guid.NewGuid(),
            TenantId = inquilino.Id,
            Email = request.Email,
            Nombre = "Admin " + request.Subdominio,
            PasswordHash = passwordHash,
            Rol = Core.Enums.SystemRole.Owner
        };

        _dbContext.Add(newUser);
        await _dbContext.SaveChangesAsync();

        return Ok(new { mensaje = "Usuario administrador e Inquilino creados exitosamente. Ya puedes hacer login." });
    }
}
