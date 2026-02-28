# Feature: Integración del Punto de Venta (Frontend)
**Fecha y Hora:** 2026-02-28 10:15
**Tipo de Cambio:** Nueva Función
**Tags:** #Modulo_POS, #Importancia_Critica, #Area_Frontend, #Nivel_UX_Alto

## Impacto en Multi-tenancy
El AppLayout existente inyecta automáticamente el token de portador (Bearer JWT) de Zustand en cada solicitud mediante `apiClient.ts`. Al solicitar el catálogo base para la pantalla POS, el backend reconoce pasivamente el Tenant del que solicitó gracias al Header Authorization.

## Detalle Técnico
- **API Wrapper:** Creación de `features/pos/api/posApi.ts` abstrayendo los tres llamados primordiales hacia el back-end de Ventas. Mapeo estricto Typescript utilizando los DTOs definidos `MetodoPagoDto`, `ProductoLayerPosDto`, `CobrarTicketDetalleDto` y `CobrarTicketDto`.
- **Refactorización de PosPage:**
  - El catálogo hardcodeado de `MOCK_PRODUCTOS` ha sido suplantado introduciendo hooks `useEffect` para el fetcheo de productos vivos en BD y sus Métodos de Pago dinámicos en un loadState unificado.
  - Al realizar adiciones en el carrito, ahora retenemos la traza profunda del GUID transaccional de PostgreSQL en `varianteId` para evitar fallos HTTP 400 por Foreign Keys inválidas.
  - El botón "Cobrar" posee una validación pasiva inhabilitada para impedir la transacción ante cualquier carrito carente de productos o falto del Método de Pago, el cual es forzoso en el DTO de Payload Final.

## Explicación Didáctica
- **Un enchufe para interactuar:** Antes, la página web de tu POS era sólo una foto estática y un prototipo, todas las ropas eran "de mentira", y si hacías clic en "Cobrar" nos daba una alerta genérica. Lo que agregamos recién fue los "enchufes" (`posApi.ts`).  Estos enchufes conectaron tu cuadro eléctrico temporal con el panel general real (`.NET`), energizando la interfaz entera: en vez de ropas mágicas, lee todas las que el negocio cargó en la otra pestaña.
- **Mapeo de Carrito Cúbico:** Como los talles M, L y XL están sueltos del lado visual del cliente (te da una "botonera" plana en grilla), el carrito en lugar de enviar un objeto gigante le cuenta al back: "Anotame la variable con ID t3rrt4; compré 1 y la pagué tanto". El back con eso arma el ticket general.
