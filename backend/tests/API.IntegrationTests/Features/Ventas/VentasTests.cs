using System.Net;
using System.Net.Http.Json;
using API.IntegrationTests.Infrastructure;
using Application.DTOs.Ventas;
using FluentAssertions;
using Xunit;

namespace API.IntegrationTests.Features.Ventas;

[Collection("Integration_Tests_En_Serie")]
public class VentasTests : BaseIntegrationTest
{
    public VentasTests(IntegrationTestWebAppFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CobrarTicket_ConPayloadIncompleto_ReturnBadRequest()
    {
        AuthenticateClient();

        var payload = new CobrarTicketDto 
        { 
            MetodoPagoId = Guid.Empty, 
            MontoTotalDeclarado = -50, // ERROR: Monto no puede ser negativo
            Detalles = new List<CobrarTicketDetalleDto>() // ERROR: Ticket sin items
        };

        var response = await _client.PostAsJsonAsync("/api/ventas/cobrar", payload);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
