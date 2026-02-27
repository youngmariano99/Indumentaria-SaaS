# 2026-02-27_0940_Feature_PuntoDeVentaTransaccional.md
#Modulo_PuntoDeVenta, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad

## Tipo de Cambio
Nueva Función — Sprint 4 Backend: Punto de Venta (POS) Transaccional

## Fecha y Hora
2026-02-27 09:40

## Impacto en Multi-tenancy
**Crítico y protegido.** Todas las entidades nuevas (`Venta`, `VentaDetalle`, `MetodoPago`) implementan `IMustHaveTenant`, y el `ApplicationDbContext` aplica global query filters sobre `TenantId`. Esto garantiza que un inquilino jamás verá ni podrá modificar las ventas de otro local.

Adicionalmente, se reforzó la seguridad financiera mediante:
- `TenantResolverService` ahora también expone `UserId` (el cajero logueado), permitiendo auditoría completa de quién cobró qué ticket.
- Los endpoints de Ventas exigen `[Authorize]` con JWT válido.

## Detalle Técnico

### Capa Core — Nuevas Entidades de Dominio
Se modelaron 4 artefactos clave en `src/Core`:

| Artefacto | Tipo | Descripción |
|---|---|---|
| `EstadoVenta` | Enum | Estados del ciclo de vida del ticket: `Cobrada`, `Pendiente`, `FacturadaARCA`, `Anulada`. |
| `MetodoPago` | Entidad | Tabla de referencia de métodos de cobro (efectivo, tarjeta débito, crédito, QR). Soporta control de aprobación de administrador y activación/desactivación. |
| `Venta` | Entidad | Cabecera del ticket: quién cobró, cuándo, con qué método, cuánto y en qué estado. Incluye campo `CAE` para futura integración ARCA. |
| `VentaDetalle` | Entidad | Líneas del ticket. Cada línea **congela el precio al momento de la venta** mediante `PrecioUnitarioAplicado`, asegurando que si mañana se modifica el catálogo, el historial contable queda intacto. |

### Capa Infraestructura — Persistencia
- **FluentAPI Configurations** creadas para las 3 entidades, con reglas de borrado cuidadosamente diseñadas:
  - `Venta → VentaDetalle`: `Cascade` (si se anula la cabecera, se borran los ítems).
  - `VarianteProducto → VentaDetalle`: `Restrict` (**nunca** se puede borrar una variante que tenga ventas asociadas. Preservación de historial financiero).
  - `Usuario → Venta`: `Restrict` (no se puede eliminar un cajero que tiene ventas registradas).
- **Migración**: `AddPuntoDeVentaCoreEntities` generada y aplicada exitosamente a PostgreSQL Neon.
- **`IApplicationDbContext`** actualizado con los DbSets: `Ventas`, `VentasDetalles`, `MetodosPago`.
- **`ITenantResolver` e implementación `TenantResolverService`** extendidos para exponer `UserId` y `SetUserId`, capturando el ID del cajero desde el claim `NameIdentifier` del JWT en el Middleware.

### Capa Application — CQRS
Se crearon 3 artefactos en `src/Application/Features/Ventas`:

| Archivo | Tipo | Qué hace |
|---|---|---|
| `CobrarTicketCommand.cs` | Command + Handler | Transacción ACID completa: valida payload, obtiene precios reales de la BD (anti-fraude), registra la `Venta` y sus `VentaDetalle` dentro de una `BeginTransactionAsync`. Si algo falla, hace Rollback automático. |
| `ObtenerCatálogoParaPosQuery.cs` | Query + Handler | Retorna un DTO liviano con productos y variantes, optimizado para cargar la grilla táctil del POS sin penalización de red. |
| `CobrarTicketValidator.cs` | FluentValidation | Valida el `CobrarTicketCommand` antes de que llegue al Handler: requiere MetodoPago, monto ≥ 0, al menos 1 ítem, cantidad > 0 por ítem. |

**Corrección crítica en `Program.cs`**: Se reemplazó el escaneo dinámico de assemblies de MediatR y FluentValidation basado en `AppDomain.CurrentDomain.GetAssemblies()` por `RegisterServicesFromAssemblyContaining<T>` y `AddValidatorsFromAssemblyContaining<T>` anclados a tipos concretos. Esto garantiza que los validators se descubren correctamente tanto en producción como en el entorno de tests.

### Capa API
- **`VentasController`** con dos endpoints:
  - `GET  /api/ventas/pos-grid` → Catálogo liviano para el terminal táctil.
  - `POST /api/ventas/cobrar` → Procesa el cobro transaccionalmente.

### Testing
- **`VentasTests.cs`** en `API.IntegrationTests`: test `CobrarTicket_ConPayloadIncompleto_ReturnBadRequest` que verifica que un payload con monto negativo y sin ítems recibe **HTTP 400 Bad Request** (gracias al pipeline de validación MediatR → FluentValidation → ExceptionHandlingMiddleware).
- **Resultado**: 7/7 tests pasando ✅.

---

## Explicación Didáctica

### ¿Qué construimos exactamente?

Imaginate que el SaaS ahora tiene **una caja registradora digital**. Y no es una caja cualquiera: es una que tiene tres super poderes de seguridad incorporados.

### Super Poder #1: Los Precios los Pone la Base de Datos, no el Cliente 🔒

Cuando el cajero toca la pantalla para cobrar, el celular o la tablet **manda una lista** de lo que vendió al servidor. Esa lista incluye el precio que el cajero *cree* que cuesta cada producto. Pero el servidor **no confía en esos precios**. Lo que hace es:
1. Agarrar el `VarianteProductoId` de la lista.
2. **Buscarlo en la propia base de datos** para obtener el precio *real*.
3. Calcular el total de nuevo por su cuenta.
4. Si el total que mandó el cajero difiere por más de $1 del total real, rechaza la operación con un error.

Esto evita que alguien haga trampa modificando los precios en el celular antes de mandar la petición.

### Super Poder #2: Todo o Nada (Transacción ACID) 💪

Cuando se procesa un cobro se hacen varias cosas juntas: crear la `Venta`, crear cada `VentaDetalle`, y en el futuro descontarle stock al inventario. El `CobrarTicketCommand` abre una **transacción de base de datos** real (`BeginTransactionAsync`).

Pensalo así: Es como cuando vas al banco a transferir plata entre cuentas. El banco no puede debitar de tu cuenta si no puede acreditar en la cuenta del otro. **O se hacen las dos operaciones juntas, o no se hace ninguna.** Si en el medio de grabar uno de los 5 detalles del ticket hay un error de red, PostgreSQL automáticamente revierte (Rollback) todo, como si nunca hubiera pasado nada. La venta queda en 0.

### Super Poder #3: El Historial Contable es Inviolable 📜

Las líneas del ticket (`VentaDetalle`) guardan el precio **al momento de la venta** en la columna `PrecioUnitarioAplicado`. Si mañana el dueño del local le sube el precio a un producto, **las ventas del mes pasado siguen mostrando el precio al que realmente se vendió**. Esto es esencial para la contabilidad.

Además, la base de datos está configurada para que **nunca se pueda eliminar una variante de producto que tiene ventas** (via `DeleteBehavior.Restrict`). Así te asegurás que en 3 años, cuando el contador del cliente pida los informes, todos los datos del historial siguen intactos.

### El Flujo Completo de un Cobro
```
[Pantalla Táctil React]
        ↓ POST /api/ventas/cobrar (payload con ítems)
[VentasController]
        ↓ manda al pipeline de MediatR
[CobrarTicketCommandValidator] ← FluentValidation
        ↓ si hay errores → ExceptionHandlingMiddleware → HTTP 400
        ↓ si OK
[CobrarTicketCommandHandler]
        ↓ BeginTransactionAsync
        ↓ Para cada ítem: busca precio REAL en BD
        ↓ Crea Venta + VentaDetalles
        ↓ SaveChangesAsync
        ↓ CommitAsync
[Respuesta] HTTP 201 Created → { VentaId: "..." }
```
