using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using API.IntegrationTests.Infrastructure;
using Application.DTOs.Auth;
using FluentAssertions;
using Xunit;

namespace API.IntegrationTests.Features.Auth;

[Collection("Integration_Tests_En_Serie")]
public class AuthTests : BaseIntegrationTest
{
    public AuthTests(IntegrationTestWebAppFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_ConCredencialesInvalidas_DebeDevolverUnauthorized()
    {
        // Arrange
        var requestPayload = new LoginRequest
        {
            Subdominio = "demo",
            Email = "no_existo@indumentaria.com",
            Password = "clave_incorrecta"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", requestPayload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_SinEmailOClave_DebeDevolverBadRequest()
    {
        // Arrange
        var requestPayload = new LoginRequest
        {
            Subdominio = "demo",
            Email = "", // Email vacío
            Password = "123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", requestPayload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
