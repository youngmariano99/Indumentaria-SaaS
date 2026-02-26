# 2026-03-20_1217_Feature_TestingAutomatizadoIntegrado.md
#Modulo_Testing, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad

## Tipo de Cambio
Nueva Función (Infraestructura de Testing)

## Fecha y Hora
2026-03-20 12:17 (Aproximación de término de Sprint 3.1)

## Impacto en Multi-tenancy
Nulo sobre el sistema en producción. Las pruebas de integración interceptan y emulan un "Tenant Fantasma" que existe estrictamente durante los milisegundos que dura la prueba corriendo en la memoria RAM `ApplicationDbContext.Database.EnsureCreated()`.

## Detalle Técnico
Se configuró un framework robusto y autosuficiente para validar los endpoints (`WebApplicationFactory`).
*   Se agregó referenciación transversal entre el proyecto `tests/API.IntegrationTests` y la `API` principal permitiendo que `Program.cs` se buildee para modo "Test".
*   Se forzó a la canalización _MediatR_ y sus pipeline _Behavior_ a arrojar Excepciones limpias 400 mediante la creación de `API.Middleware.ExceptionHandlingMiddleware` para evitar crashes por validaciones puras.
*   Frameworks: xUnit, FluentAssertions, EF Core InMemory.

---

## Explicación Didáctica

¡Excelente trabajo incorporando la infraestructura de Software "Grado-Empresa"! Vamos a despejar esas 4 dudas de manera súper sencilla y "con cancha":

### 1) ¿Cómo funcionan los tests? (Paso a paso)
Imaginate que tenés un **clon tuyo súper rápido que navega por internet**.
1. Abrís la consola y tirás `dotnet test`. Ese es tu clon despertándose.
2. Tu clon **crea un servidor web entero del SaaS** igualito al real de Producción, pero lo pone a correr oculto (sin usar tu puerto 5000 ni Chrome).
3. **Crea una Base de Datos "de juguete"** que vive en la memoria RAM. Genera un Inquilino falso ("Tienda Demo") y un Usuario fantasma autologueado usando JWT.
4. **Empieza a hacer clics y mandar peticiones REST (POST, GET):** Por ejemplo, intenta crear una remera con precio $0.
5. El servidor rechaza la remera con un `Error 400 Bad Request`.
6. Tu clon anota con fibrón verde: _"Correcto. Rechazó la remera trucha como se esperaba"_ (`response.StatusCode.Should().Be(BadRequest)`).
7. Cuando termina de revisar las "tarjetas de tareas" (esos son los `[Fact]`), **destruye la base de datos de juguete, apaga el servidor web invisible y te dice por la consola "Resumen: todo verde"**.

### 2) ¿Cambiaste algo del sistema principal o creaste una "Maqueta" que replica el sistema para los test nada más?
**Cree una maqueta inteligente, pero usé el sistema 100% real de Producción para las reglas operativas.**
Lo único que hicimos (vía `IntegrationTestWebAppFactory`) fue **quitarle el cable a la Base de Datos PostgreSQL real (Neon) y enchufarle el cable de la "Base en Memoria RAM"**. Todo lo demás (el validador de ARCA futuro, MediatR, CQRS, Controllers) es idéntico a lo que tocará el cajero de local en Producción. Por ende las pruebas son hiper confiables; si el test falla, fallaría en la calle.

*(Nota técnica: Solo agregamos un Middleware nuevo `ExceptionHandlingMiddleware` al código principal para que los errores de código se muestren bonitos en JSON y no rompan la app. Todo un golazo).*

### 3) ¿Cómo lo uso y puedo entender el feedback fácilmente?
Vos tenés que abrir la consola integrada de tu Visual Studio o VSC y escribir:
`dotnet test`

Te puede arrojar tres colores/textos:
- **Todo Verde ("Test Run Successful"):** Excelente. El código que cambiaste hoy no rompió lo que hicimos ayer. Podés irte a tomar un mate en paz.
- **Rojo/Amarillo ("Test Run Failed"):** ¡Guarda! Vas a ver un mensaje como este:
  > _Expected response.StatusCode to be BadRequest {400}, but found Created {201}._
  Eso significa en lenguaje humano: _"Esperábamos que la API rebotara esta facturación con error, pero el servidor la aceptó y grabó. Hay una regla de validación de negocio rota."_

### 4) En futuras funcionalidades nuevas, ¿Será fácil integrarlo al test?
**Facilísimo.** Como armé la "Fábrica Base" (`BaseIntegrationTest.cs`), la parte difícil (configurar inyección de dependencias, base de datos en blanco y JWT simulado) ya está resuelta.
Para los próximos Sprints donde agreguemos Punto de Venta o Wallet Financiera, vos solo tenés que armar un archivo nuevo con `[Fact]` y usar el cliente pre-existente llamando a la API así: 

`var respuesta = await _client.PostAsJsonAsync("/api/wallet/transferir", ...);`
`respuesta.StatusCode.Should().Be(...);`

¡Es cuestión de Copiar, Pegar el test base y cambiar el nombre del Endpoint!
