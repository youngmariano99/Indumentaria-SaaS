#Modulo_CRM #Importancia_Alta #Area_Backend #Nivel_Estandar

# Feature: Módulo Cliente 360 y CRM (Backend)

## Detalles Generales
- **Fecha y Hora**: 2026-02-28 19:05
- **Tipo de Cambio**: Nueva Función

## Impacto en Multi-tenancy
- La entidad `Cliente` hereda de `IMustHaveTenant` para garantizar el aislamiento de la cartera de clientes de cada sucursal/tenant.
- Las consultas mediante el patrón CQRS verifican automáticamente la resolución del Tenant actual a través de Entity Framework (arquitectura base inyectada).
- Validación estricta que impide registrar dos documentos idénticos (CUIT/DNI) dentro del mismo Tenant.

## Detalle Técnico
- **Base de Datos**: Se agrega una nueva tabla `Clientes` a la base de datos PostgreSQL, soportando soft-delete (`ISoftDelete`) a través de la interfaz fundacional, sumando historial auditable (`CreatedAt`). Se generó y aplicó a la base de Neon la migración de Entity Framework Core `AddModuloClientesCRM`.
- **Relaciones EF Core**: La entidad principal `Venta` ha sido modificada con un campo opcional `ClienteId` como Foreign Key para permitir registrar tickets cobrados asociándolos con nombres de la cartera fija.
- **Enums y Fiscalidad**: Introducción del enumerador avanzado de fiscalidad `CondicionIva` para alinear el sistema con ARCA de cara al futuro.
- **Lógica de Negocios**: Implementación robusta de CQRS con MediatR agregando endpoints en `ClientesController`: Crear, Editar, Eliminar, además de Consultas Avanzadas como `ObtenerCliente360Query` que devuelve agrupaciones de métricas directas (Total Histórico Gastado, Ticket Promedio, Listado de Últimas Compras). Además se re-enrutó el endpoint del POS `CobrarTicketCommand` para que registre el ID del Cliente.

## Explicación Didáctica
- Piensen en la nueva entidad Cliente como un tarjetero o "libreta de almacenero" muy evolucionada. Cada Tenant tiene su propio estante con sus libretas.
- Antes, cuando el sistema recibía un mandato de emitir ticket (comando "CobrarTicket"), el cajero solo decía "Monto y Variante de Producto". Ahora la cajera, opcionalmente, le avisa a nuestro servidor: "El cliente que se lo lleva es fulano" (`ClienteId`).
- El "ObtenerCliente360Query" funciona como un investigador privado: no solo sabe donde vive el cliente, sino que busca de toda la montaña de comprobantes (`Ventas`) de la BD cada ticket que tiene su nombre y hace la matemática pesada (sumas y promedios) del lado del Servidor y no colapsa a la computadora del usuario.
