# Ticker: Arqueo de Caja (Historial y Cierre Ciego)

**Fecha y Hora:** 2026-03-04 18:00
**Tipo de Cambio:** Feature & Fix
**Tags:** #Modulo_Finanzas, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad

## Impacto en Multi-tenancy
La nueva query `ObtenerHistorialArqueosQuery` respeta estrictamente la política RLS y el filtrado automágicode EF Core mediante la lectura del `TenantId`. Todo el historial financiero y los cierres ciegos son invisibles para otros clientes SaaS.

## Detalle Técnico
1. **Query y Handler**: Se creó `ObtenerHistorialArqueosQuery` junto a `ObtenerHistorialArqueosQueryHandler` para devolver la lista de `ArqueoCaja` con sus detalles (`ArqueoCajaDetalle`) y la metadata del usuario (`Nombre`).
2. **Controller**: Se agregó un nuevo endpoint GET `/api/arqueocaja/historial/{storeId}` en el `ArqueoCajaController`.
3. **BugFix de Compilación**: Se removió el intento de llamar a `Usuario.Apellido` en el mappper de la query, dado que la entidad `Usuario` del sistema solo maneja la propiedad `Nombre`.
4. **BugFix Concurrencia (Contexto Anterior)**: Se documenta que el `DbUpdateConcurrencyException` al cerrar la caja se solucionó informando manualmente a EF Core el estado `EntityState.Added` de los Detalles, al ser GUIDs autogenerados que el Entity Tracker confundía con Updates fallidos.

## Explicación Didáctica
Imaginate que cerrás la persiana de tu local. Antes, el sistema guardaba el cierre pero tiraba todo a un placard oscuro donde no podías volver a verlo. 

Con este cambio, creamos una "hemeroteca" ordenada en el Backend (`ObtenerHistorialArqueosQuery`). Ahora, cuando el Frontend (el cajero) pregunta por los cierres pasados, esta query entra al armario, agarra las carpetas de arqueo que le pertenecen *exclusivamente a esta sucursal y a tu empresa* (gracias al Multi-Tenant invisible) y se las entrega listas y ordenadas por fecha.

Además, reparamos un "Cortocircuito de Compilación": antes al sistema se le pedía el "Apellido" del empleado, pero la credencial del empleado solo tenía "Nombre", lo que trababa que la hemeroteca funcionara. ¡Eso ya quedó 100% arreglado!
