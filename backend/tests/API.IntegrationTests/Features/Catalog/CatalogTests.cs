using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using API.IntegrationTests.Infrastructure;
using Application.DTOs.Catalog;
using FluentAssertions;
using Xunit;

namespace API.IntegrationTests.Features.Catalog;

[Collection("Integration_Tests_En_Serie")]
public class CatalogTests : BaseIntegrationTest
{
    public CatalogTests(IntegrationTestWebAppFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CrearProductoMatrix_ConPrecioCero_DebeRebotarPorReglaDeNegocio_BadRequest400()
    {
        // Proveer un JWT legítimo para saltar el [Authorize]
        AuthenticateClient();

        // Arrange: Preparamos un payload que sabemos que es ilegal para el sistema comercial
        var payloadInvalido = new CrearProductoDto
        {
            Nombre = "Remera",
            Descripcion = "Prueba Unitaria",
            PrecioBase = 0, // ERROR INTENCIONAL: El precio no puede ser cero
            Variantes = new List<VarianteDto>
            {
                new VarianteDto { Talle = "M", Color = "Azul", PrecioCosto = 100 }
            }
        };

        // Act: Hacemos la llamada al endpoint como si fuéramos la app de React
        var response = await _client.PostAsJsonAsync("/api/productos/matrix", payloadInvalido);

        // Assert: Confirmamos que nuestra barrera "FluentValidation" atajó la pelota
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
