using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Infrastructure.Services;
using Infrastructure.Persistence.Contexts;
using Infrastructure.Persistence.Interceptors;
using API.Middleware;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Core.Interfaces.Auth;
using Infrastructure.Auth;
using MediatR;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();

// 1. Inyección de Dependencias (Core & Infrastructure)
builder.Services.AddScoped<ITenantResolver, TenantResolverService>();
builder.Services.AddScoped<AuditInterceptor>();
builder.Services.AddScoped<TenantSessionInterceptor>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// 1.5. Configuración de MediatR y FluentValidation (CQRS)
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssemblyContaining<Application.Features.Ventas.Commands.CobrarTicketCommand>();
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(Application.Behaviors.ValidationBehavior<,>));
});

builder.Services.AddValidatorsFromAssemblyContaining<Application.Features.Auth.Validators.LoginRequestValidator>();

// Mapeo automático de Controllers
builder.Services.AddControllers();

// 2. Configuración de Autenticación y JWT
var jwtStruct = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtStruct["Secret"] ?? throw new InvalidOperationException("Jwt Secret no configurado");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtStruct["Issuer"],
            ValidAudience = jwtStruct["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// 3. Configuración de Base de Datos PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    var auditInterceptor = sp.GetRequiredService<AuditInterceptor>();
    var sessionInterceptor = sp.GetRequiredService<TenantSessionInterceptor>();
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString!)
           .AddInterceptors(auditInterceptor, sessionInterceptor);
});

// Exponer la interfaz IApplicationDbContext para los Comandos/Consultas (CQRS)
builder.Services.AddScoped<Application.Common.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 4. Middlewares Personalizados y de Seguridad
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<TenantResolverMiddleware>();

app.MapControllers(); // Registrar los endpoints de los controllers
app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

// Requerido por WebApplicationFactory para Tests de Integración
public partial class Program { }
