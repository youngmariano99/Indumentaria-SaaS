# Listado de Pruebas Automatizadas (Backend)

Este documento centraliza todas las funcionalidades del sistema que cuentan con cobertura de **Integration Testing**.
El objetivo es tener un control claro de qué partes del sistema están "blindadas" y cuáles son los escenarios probados, para que en el futuro al agregar nuevas funcionalidades se mantenga este registro actualizado.

---

## 🔐 Módulo: Autenticación (Auth)

### Función 1: Login con Credenciales Inválidas
- **Qué testea:** Valida que si un usuario intenta ingresar con un email inexistente o una contraseña incorrecta en una empresa (subdominio) válida, el sistema rechace la petición sin conceder acceso.
- **Posible Resultado Esperado:** `401 Unauthorized` (Acceso denegado).
- **Endpoint:** `POST /api/auth/login`
- **Archivo de Test:** `AuthTests.cs`
- **Información Importante:** Evita intrusiones. El sistema jamás debe devolver el Token JWT si no hay coincidencia exacta de credenciales encriptadas en la base de datos (PostgreSQL) para ese Inquilino específico.

### Función 2: Login con Formulario Incompleto
- **Qué testea:** Valida el comportamiento del sistema cuando la petición de login se envía incompleta (ej: sin email o sin contraseña). Verifica que la capa de validación rechace la solicitud antes de siquiera consultar a la base de datos.
- **Posible Resultado Esperado:** `400 Bad Request` (Petición mal formada).
- **Endpoint:** `POST /api/auth/login`
- **Archivo de Test:** `AuthTests.cs`
- **Información Importante:** Este test confirma que el *Validador* (FluentValidation) está activamente frenando peticiones "basura" en la puerta de entrada, ahorrando cómputo y sin sobrecargar la base de datos (evita caídas).

---

## 📦 Módulo: Catálogo y Productos

### Función 1: Creación de Matriz de Producto con Precio Nulo/Cero (Regla de Negocio)
- **Qué testea:** Simula una petición web intentando crear un producto matrix (ej: Remera en múltiples talles y colores) pero enviando un `PrecioBase = 0`. Verifica que las reglas de negocio estrictas no dejen pasar un producto gratuito por error.
- **Posible Resultado Esperado:** `400 Bad Request` (Rechaza la creación y avisa al sistema front-end que cambie el precio).
- **Endpoint:** `POST /api/productos/matrix`
- **Archivo de Test:** `CatalogTests.cs`
- **Información Importante:** Este test es **crítico para resguardar la salud comercial del negocio**. Confirmamos que las validaciones frenan el proceso defectuoso antes de que intente interactuar con la Base de datos. Además, testea orgánicamente que el sistema rechace el acceso a operarios sin Token JWT, ya que para llegar a este rechazo el clon de pruebas primero tuvo que Auto-Loguearse en la nube fantasma.

---

## 🛒 Módulo: Punto de Venta (POS)

### Función 1: Cobrar Ticket con Payload Incompleto o Inválido
- **Qué testea:** Verifica que si el cajero manda un ticket con monto negativo y sin ítems (o con `MetodoPagoId` vacío), el sistema rechace la operación de cobro **antes de tocar la base de datos**.
- **Posible Resultado Esperado:** `400 Bad Request`.
- **Endpoint:** `POST /api/ventas/cobrar`
- **Archivo de Test:** `VentasTests.cs`
- **Información Importante:** Este test protege la integridad financiera del sistema. El pipeline de validación (MediatR → `CobrarTicketCommandValidator` → `ExceptionHandlingMiddleware`) frena el cobro malformado antes de que el Handler abra una transacción en PostgreSQL. Además valida indirectamente que el `ValidationBehavior` encuentra el validator correcto en el assembly.

---

## 📝 Procedimiento para actualizar este archivo
En futuros Sprints (Ej: cuando agreguemos Caja/Facturación, Módulos de Wallet o manejo de Promociones), debemos mantener este documento vivo:
1. Al crear una nueva prueba (`[Fact]`) en la carpeta `tests/API.IntegrationTests`, abrí este archivo.
2. Agregá el título de la funcionalidad.
3. Describí breve y textualmente qué tramposilla le estás haciendo al sistema (ej: intentando vender sin stock).
4. Indicá qué Código HTTP (Resultado) debería dar.
5. Dejá una nota del Impacto de Negocio (Por qué esta prueba nos salva el día).

