# 2026-03-02 10:50 - Feature - Posibles Devoluciones

**Fecha y Hora:** 2026-03-02 10:50
**Tipo de Cambio:** Nueva Función
**Tags:** #Modulo_Ventas, #Importancia_Media, #Area_Backend, #Nivel_Seguridad_Estandar

## Impacto en Multi-tenancy
El cambio afecta la tabla `VentaDetalles`, la cual ya posee `TenantId`. La propiedad `PosibleDevolucion` simplemente fluye como un booleano asociado a cada fila ya auditada y validada según el tenant del cajero. No introduce riesgos de fuga entre tenants.

## Detalle Técnico
- **Base de Datos:** Se generó una migración de Entity Framework Core agregando la columna `PosibleDevolucion` (bool, default false) en la tabla `VentaDetalles`.
- **API:**
  - El endpoint `/ventas/cobrar` ahora acepta la propiedad `posibleDevolucion` por cada ítem en el `CobrarTicketDto`.
  - El DTO `Cliente360Dto` y la consulta `ObtenerCliente360Query` ahora devuelven la propiedad en cada `CompraRecienteDetalleDto`.

## Explicación Didáctica
- **Objetivo:** Cuando los cajeros venden productos que tienen alta probabilidad de ser cambiados (como un regalo con ticket de cambio), necesitan una manera de acordarse de eso.
- **Qué hicimos:** Modificamos la "factura" en el sistema (`VentaDetalle`) para que guarde un *post-it* invisible que diga "Este producto puede volver" (`PosibleDevolucion`). 
- **Cómo fluye la información:**
  1. El usuario marca el producto en la caja (Frontend PosPage).
  2. El DTO (`CobrarTicketDto`) transporta el post-it hacia el servidor.
  3. El Servidor (`CobrarTicketCommand`) agarra el post-it y lo pega permanentemente en la base de datos de PostgreSQL usando Entity Framework.
  4. Cuando el cliente vuelve, el cajero consulta su "Perfil 360", y el servidor saca de la base de datos el historial y le lee qué productos tenían el post-it pegado para priorizarlos en la pantalla de devoluciones.
