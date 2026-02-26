# 🧪 Guía "Con Cancha" de Automatización de Testing (Integration API)

En este proyecto SaaS para Indumentarias no queremos "probar suerte". Por eso armamos un sistema de **Integration Testing (Testeo de Extremo a Extremo en la API)**.

A diferencia del Testeo Unitario clásico, aquí nosotros encendemos la aplicación web real completa (`API.csproj`), pero sin escuchar un puerto de Windows como el 5000 y **sin tocar tu PostgreSQL real**. A esto lo llamamos el "Navegador Fantasma" o `WebApplicationFactory`.

## 1. ¿Cómo se corre esto?
Es facilísimo. Abres tu consola en la carpeta `backend` y tiras:
```bash
dotnet test
```

Verás una pantalla verde (si no rompiste nada) diciéndote cuántos tests pasaron.

## 2. ¿Qué paquetes usamos para la magia?
- **xUnit**: Es nuestro motor de tests (las cosas que dicen `[Fact]`).
- **Microsoft.AspNetCore.Mvc.Testing**: Levanta la API en RAM simulando un cliente web.
- **Entity Framework Core InMemoryDatabase**: Reemplaza temporalmente nuestra Base PostgreSQL. Cuando corres el test, la base se crea desde cero en la RAM, se prueba, y cuando el test termina, la base de datos se evapora (se destruye). ¡No más basura de prueba en tu base local principal!
- **FluentAssertions**: Hace que el código de prueba se lea como una oración en español/inglés ("Quiero que mi respuesta sea un código Bad Request"): 
`respuesta.StatusCode.Should().Be(HttpStatusCode.BadRequest);`

## 3. ¿Cómo armo un nuevo Test?
Supongamos que en el Sprint 4 agregas el "Punto de Venta". Vas a la carpeta `tests/API.IntegrationTests/Features/PuntoDeVenta` y creas una clase nueva:

```csharp
using API.IntegrationTests.Infrastructure;
using Xunit;
using FluentAssertions;

namespace API.IntegrationTests.Features.PuntoDeVenta;

// SIEMPRE que heredes de BaseIntegrationTest, obtienes _client (el navegador fantasma)
// y _factory.
public class CobrosTests : BaseIntegrationTest
{
    public CobrosTests(IntegrationTestWebAppFactory factory) : base(factory) { }

    [Fact]
    public async Task CobrarTicket_ConCeroPesos_DebeRebotar400()
    {
        // 1. Arrange (Preparan Payload malicioso o defectuoso)
        var ticketRoto = new { Total = 0 };

        // 2. Act (Llaman al endpoint)
        var respuesta = await _client.PostAsJsonAsync("/api/ventas/cobrar", ticketRoto);

        // 3. Assert (Verifican)
        respuesta.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }
}
```

## Beneficios
Con esta malla de seguridad vas a poder tocar cualquier parte del núcleo y de los DTOs, porque antes de hacer `git push`, el servidor CI/CD (o vos mismo localmente con un `dotnet test`) verificará que tu nuevo cambio no haya roto el inicio de sesión ni la carga del Catálogo. Todo automatizado en microsegundos.
