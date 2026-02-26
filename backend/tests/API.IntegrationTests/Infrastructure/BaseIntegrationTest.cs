using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace API.IntegrationTests.Infrastructure;

public abstract class BaseIntegrationTest : IClassFixture<IntegrationTestWebAppFactory>
{
    protected readonly HttpClient _client;
    protected readonly IntegrationTestWebAppFactory _factory;

    protected BaseIntegrationTest(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    // Helper method temporal por si necesitamos acceder directamente a EF Core
    protected TService GetService<TService>() where TService : notnull
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<TService>();
    }

    protected void AuthenticateClient()
    {
        var tokenGenerator = GetService<Core.Interfaces.Auth.IJwtTokenGenerator>();
        var token = tokenGenerator.GenerateToken(new Core.Entities.Usuario
        {
            Id = System.Guid.NewGuid(),
            TenantId = System.Guid.NewGuid(),
            Rol = Core.Enums.SystemRole.Owner,
            Nombre = "Usuario Fantasma",
            Email = "test@test.com"
        });
        
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }
}
