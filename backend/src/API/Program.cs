using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Infrastructure.Services;
using Infrastructure.Persistence.Contexts;
using Infrastructure.Persistence.Interceptors;
using API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();

// 1. Inyección de Dependencias (Core & Infrastructure)
builder.Services.AddScoped<ITenantResolver, TenantResolverService>();
builder.Services.AddScoped<AuditInterceptor>();
builder.Services.AddScoped<TenantSessionInterceptor>();

// 2. Configuración de Base de Datos PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    var auditInterceptor = sp.GetRequiredService<AuditInterceptor>();
    var sessionInterceptor = sp.GetRequiredService<TenantSessionInterceptor>();
    options.UseNpgsql(connectionString)
           .AddInterceptors(auditInterceptor, sessionInterceptor);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 3. Middlewares Personalizados
app.UseMiddleware<TenantResolverMiddleware>();

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
