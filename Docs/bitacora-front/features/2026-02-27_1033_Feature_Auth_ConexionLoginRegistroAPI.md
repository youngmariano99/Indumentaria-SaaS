# Frontend — Auth: Conexión Real del Registro y Login al Backend

**Tags:** `#Modulo_Auth`, `#Area_Frontend`, `#Feature`, `#Integracion_API`, `#Seguridad`

---

## Fecha y hora

- **Fecha:** 2026-02-27  
- **Hora:** 10:33 (Argentina)

---

## Tipo de cambio

**Nueva Función** — Conexión del flujo de Registro y Login al backend real. Reemplaza los `setTimeout` de simulación por llamadas HTTP reales. Sin modificaciones a la identidad visual ni al diseño.

---

## Contexto: qué pasó y por qué

El `LoginScreen` ya tenía la lógica de API implementada desde el Sprint 3. Sin embargo:

1. El **`RegisterPage.tsx`** usaba un `setTimeout` simulado que hacía redirect al `/login` sin crear nada en la base de datos.
2. El **`authApi.ts`** solo tenía el método `login`, no existía `register`.
3. El **`apiClient.ts`** apuntaba al puerto `5240` en lugar del `5063` real del backend (esto causaba que todas las peticiones fallaran silenciosamente).

---

## Impacto en multi-tenancy

**Directo pero controlado.** El endpoint de registro (`register-admin-temp`) crea un nuevo `Inquilino` (Tenant) en la base de datos usando el subdominio generado como identificador único. Desde ese momento, el nuevo negocio queda aislado del resto de tenants por el global query filter del `ApplicationDbContext`.

---

## Detalle técnico

### Archivos modificados

| Archivo | Cambio |
|--------|--------|
| `frontend/src/lib/apiClient.ts` | Corregido puerto de `5240` → `5063` (según `launchSettings.json` del backend). |
| `frontend/src/features/auth/types/index.ts` | Agregado tipo `RegisterRequest { subdominio, email, password }` que mapea exactamente al endpoint del backend. |
| `frontend/src/features/auth/api/authApi.ts` | Agregado método `register(data: RegisterRequest): Promise<void>` que llama a `POST /api/auth/register-admin-temp`. |
| `frontend/src/features/auth/RegisterPage.tsx` | Reemplazado `setTimeout` por llamada real a `authApi.register`. Lógica de generación automática del subdominio desde el nombre del local. Manejo de errores del servidor. Redirección a `/login` con mensaje de éxito vía React Router state. |
| `frontend/src/features/auth/components/LoginScreen.tsx` | Importado `useLocation` para capturar el mensaje de éxito procedente del registro. Añadido estado `successMsg` y su renderizado en el form. |

### Lógica de generación del subdominio

El usuario registra su negocio con "Nombre del negocio" (campo visual amigable). El campo `subdominio` que necesita el backend se calcula automáticamente en el cliente **antes** de enviar la petición:

```typescript
const subdominio = nombreComercial.trim().toLowerCase().replace(/\s+/g, "-");
// "Mi Tienda Ropa" → "mi-tienda-ropa"
```

Esto simplifica la experiencia de usuario y estandariza el formato del subdominio.

### Flujo completo de Registro → Login

```
1. Usuario completa el formulario de registro
        ↓
2. Frontend valida campos localmente (sin API)
        ↓
3. POST /api/auth/register-admin-temp
   { subdominio: "mi-tienda", email, password }
        ↓
4a. 200 OK → navigate("/login", { state: { mensaje: "¡Cuenta creada!" } })
4b. Error del servidor → setError(mensaje del backend)
        ↓
5. LoginScreen lee location.state.mensaje → muestra aviso verde ✓
```

### Archivos no modificados

- Lógica de login en `LoginScreen.tsx` (ya estaba conectada al backend).
- `authStore.ts`, contratos de `LoginResponse`, `LoginRequest`.
- Todo el diseño visual y los módulos CSS.

---

## Explicación Didáctica

### ¿Por qué el subdominio no lo ve el usuario?

En un SaaS real (como Shopify, Tienda Nube), el "subdominio" es el código único de cada negocio. Por ejemplo, `milocalito.miapp.com`. Pero pedirle al dueño de un local de ropa que "ingrese su subdominio" es confuso y propenso a errores.

La solución fue generar ese código automáticamente del nombre del negocio que sí sabe ingresar. Si se llama "Jeans y Más", el sistema crea `jeans-y-mas` como subdominio internamente. Simple.

Para los tests de desarrollo, el campo de subdominio sigue apareciendo visible (solo en `localhost`) porque el desarrollador necesita saber con qué código identificarse al hacer login.

---

## Referencias

- `Docs/Integraciones/Front_Int_API_PuntoDeVenta-POS.md` — Patrón seguido para integrar front con backend.
- `Docs/bitacora-back/features/2026-02-25_1300_Feature_Auth_y_Subdominios.md` — Origen del endpoint de auth.
- `Docs/bitacora-back/fixes/2026-02-27_1050_Fix_CORS_y_Puerto.md` — Fix de backend que habilitó estas peticiones.
