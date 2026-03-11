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
    private readonly FluentValidation.IValidator<LoginRequest> _loginValidator;
    private readonly FluentValidation.IValidator<RegisterRequest> _registerValidator;

    public AuthController(
        ApplicationDbContext dbContext, 
        IPasswordHasher passwordHasher, 
        IJwtTokenGenerator jwtTokenGenerator,
        FluentValidation.IValidator<LoginRequest> loginValidator,
        FluentValidation.IValidator<RegisterRequest> registerValidator)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
    }

    [HttpPost("login")]
    [AllowAnonymous] // El login es público
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => new { Propiedad = e.PropertyName, Error = e.ErrorMessage });
            return BadRequest(new { mensaje = "Errores de validación", detalles = errors });
        }

        // 1. Buscamos al Inquilino por su subdominio e incluimos su Rubro
        var inquilino = await _dbContext.Inquilinos
            .Include(i => i.Rubro)
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
            Rol = usuario.Rol,
            RubroId = inquilino.RubroId,
            DiccionarioJson = inquilino.Rubro?.DiccionarioJson,
            EsquemaMetadatosJson = inquilino.Rubro?.EsquemaMetadatosJson
        });
    }

    // Método para facilitar la carga de un usuario administrador inicial
    // para un tenant específico, ahora con soporte para Rubros.
    [HttpPost("register-admin-temp")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterAdminTemp([FromBody] RegisterRequest request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => new { Propiedad = e.PropertyName, Error = e.ErrorMessage });
            return BadRequest(new { mensaje = "Errores de validación", detalles = errors });
        }
        // 1. Validar si el inquilino ya existe
        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Subdominio == request.Subdominio);

        if (inquilino != null)
        {
            return BadRequest(new { mensaje = "El subdominio ya está registrado." });
        }

        // 2. Resolver el Rubro (si no se envía, buscamos el de 'Indumentaria' o el primero)
        var rubroId = request.RubroId;
        if (!rubroId.HasValue)
        {
            var rubroBase = await _dbContext.Rubros.FirstOrDefaultAsync(r => r.Nombre == "Indumentaria") 
                            ?? await _dbContext.Rubros.FirstOrDefaultAsync();
            
            if (rubroBase == null)
            {
                return BadRequest(new { mensaje = "No hay rubros configurados en el sistema. Contacte al administrador." });
            }
            rubroId = rubroBase.Id;
        }

        // 3. Crear el Inquilino
        inquilino = new Core.Entities.Inquilino 
        { 
            Id = Guid.NewGuid(), 
            NombreComercial = request.NombreComercial,
            Subdominio = request.Subdominio,
            RubroId = rubroId.Value
        };
        _dbContext.Inquilinos.Add(inquilino);

        // 4. Crear el Usuario Administrador (Owner)
        var passwordHash = _passwordHasher.Hash(request.Password);
        
        var newUser = new Core.Entities.Usuario
        {
            Id = Guid.NewGuid(),
            TenantId = inquilino.Id,
            Email = request.Email,
            Nombre = "Admin " + (string.IsNullOrEmpty(request.NombreComercial) ? request.Subdominio : request.NombreComercial),
            PasswordHash = passwordHash,
            Rol = Core.Enums.SystemRole.Owner
        };

        _dbContext.Add(newUser);
        await _dbContext.SaveChangesAsync();

        return Ok(new { mensaje = "Negocio y administrador creados exitosamente. Ya puedes iniciar sesión." });
    }

    [HttpPost("register-superadmin")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterSuperAdmin([FromBody] LoginRequest request)
    {
        // El SuperAdmin necesita estar atado a un tenant "Master" o uno genérico.
        var inquilino = await _dbContext.Inquilinos
            .FirstOrDefaultAsync(i => i.Subdominio == "master-saas");

        if (inquilino == null)
        {
            inquilino = new Core.Entities.Inquilino 
            { 
                Id = Guid.NewGuid(), 
                NombreComercial = "Master SaaS",
                Subdominio = "master-saas" 
            };
            _dbContext.Inquilinos.Add(inquilino);
        }

        var passwordHash = _passwordHasher.Hash(request.Password);
        
        var newUser = new Core.Entities.Usuario
        {
            Id = Guid.NewGuid(),
            TenantId = inquilino.Id,
            Email = request.Email,
            Nombre = "Super Admin Root",
            PasswordHash = passwordHash,
            Rol = Core.Enums.SystemRole.SuperAdmin // O Rol = 4
        };

        _dbContext.Add(newUser);
        await _dbContext.SaveChangesAsync();

        return Ok(new { mensaje = "SuperAdmin creado exitosamente." });
    }
}
