# 2026-02-27_1050_Fix_CORS_y_Puerto.md
#Modulo_Infraestructura, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad

## Tipo de Cambio
BugFix crítico — CORS no configurado + Puerto incorrecto en el cliente HTTP

## Fecha y Hora
2026-02-27 10:50

## Impacto en Multi-tenancy
Ninguno funcional. Sin embargo, este fix es la condición necesaria para que **cualquier** operación de tenant funcione desde el frontend, incluyendo el login, el registro y todas las futuras peticiones autenticadas. Sin este fix, el backend era inalcanzable desde el browser.

## Detalle Técnico

### Problema 1: Puerto incorrecto en `apiClient.ts`

El interceptor de axios apuntaba a `http://localhost:5240/api` pero el perfil HTTP de `launchSettings.json` del backend define el puerto `5063`. Esto causaba que **todas las peticiones** del frontend terminaran en un `ERR_CONNECTION_REFUSED` antes de llegar al backend.

**Fix:** `frontend/src/lib/apiClient.ts`
```diff
-const BASE_URL = 'http://localhost:5240/api';
+const BASE_URL = 'http://localhost:5063/api';
```

### Problema 2: CORS no configurado en el backend

Los navegadores modernos implementan la política **Same-Origin Policy**: bloquean automáticamente las respuestas de un servidor a un dominio diferente, a menos que el servidor las autorice explícitamente con cabeceras CORS.

El frontend corre en `http://localhost:5173` (Vite) y el backend en `http://localhost:5063` (ASP.NET). Son **orígenes distintos** (puerto diferente = origen diferente). Sin `Access-Control-Allow-Origin` en las respuestas del backend, el browser bloqueaba todas las respuestas silenciosamente — el backend procesaba la petición correctamente pero el browser descartaba la respuesta.

**Fix:** `backend/src/API/Program.cs`

Se agregó la política `FrontendDev` de CORS, registrada **antes** de construir el pipeline HTTP, y aplicada *antes* de `UseAuthentication` (el orden importa en ASP.NET):

```csharp
// Registro del servicio CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:5174",  // fallback port
                "http://localhost:3000"   // create-react-app fallback
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Activación en el pipeline (antes de UseAuthentication)
app.UseCors("FrontendDev");
```

### Por qué el orden de `UseCors` importa

Si `UseCors` se coloca **después** de `UseAuthentication`, el browser ya rechazó el preflight (petición `OPTIONS`) antes de que el middleware de autenticación responda, porque nunca recibió las cabeceras CORS. El resultado: error de CORS aunque el endpoint sea anónimo.

El orden correcto del pipeline es:
```
UseCors → UseMiddleware<ExceptionHandlingMiddleware> → UseAuthentication → UseAuthorization → ...
```

---

## Explicación Didáctica

### La Analogía del Portero de Boliche

Imaginate que el backend es un boliche y el frontend es el micro con los invitados. El **CORS** es el portero.

Sin CORS configurado, el portero tiene instrucciones estrictas: "Solo entra gente del mismo barrio (mismo puerto/dominio). Si el micro viene de otro barrio, aunque tenga invitación (JWT), no pasa."

Al agregar la política `FrontendDev`, le damos instrucciones al portero: "Al micro de Vite que viene del puerto 5173, dejalo pasar siempre que tenga `Content-Type` y `Authorization`."

El browser (Chrome, Firefox) es el que actúa de portero del lado del cliente: cuando hace una petición a un servidor en otro origen, primero le manda un "aviso" (`OPTIONS`) preguntando "¿te parece que entre?". Si el servidor no responde con las cabeceras correctas, el browser bloquea toda la operación.

### ¿Esto es un problema en producción?

En producción, el frontend y el backend suelen estar en el mismo dominio (ej: `api.miapp.com` y `miapp.com`), o el backend ya está configurado con una lista blanca restrictiva de orígenes. La política `FrontendDev` es solo para ambiente local. Para producción habrá que agregar otra política con los dominios reales del despliegue.
