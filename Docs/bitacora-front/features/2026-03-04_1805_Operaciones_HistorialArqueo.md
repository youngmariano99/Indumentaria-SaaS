# Modulo: ArqueoPage (Historial y UI Refinements)

**Fecha y Hora:** 2026-03-04 18:05
**Tipo de Cambio:** Feature & Fix
**Tags:** #Modulo_Operaciones, #Importancia_Critica, #Area_Frontend, #Nivel_UI

## Overview
Implementación fundamental en el módulo de Arqueo de Caja (`ArqueoPage.tsx`), añadiendo el historial completo de jornadas y solucionando un bug severo que enviaba `$0` en los conteos de *Cierre Ciego*.

## Detalle Técnico
1. **Tabs System**: Se reestructuró la UI en dos pestañas principales (`Actual` e `Historial`) para no sobrecargar el componente.
2. **Historial y Tabla**:
   - Se conectó `arqueoApi.getHistorial` para renderizar el mapeo histórico.
   - Formateo de moneda estricto y cálculo de "Diferencia" usando estilos en línea para denotar *Faltantes* y *Sobrantes* explícitos de caja.
3. **Modal de Detalle "Factura"**:
   - Generación de Modal overlay para desglosar una fila del historial por Método de Pago, observaciones y una suma total del saldo inicial más ventas contra lo real del cajero.
4. **BugFix de Inputs Cierre**:
   - **Causa Analizada:** El frontend armaba los casilleros de dinero a contar basado en `arqueo.detalles`. Pero una caja abierta no posee los registros de detalle (estos nacen en la BD al cerrarse).
   - **Solución:** Se incluyó asincronamente `posApi.obtenerMetodosPago` en el Load `useEffect`. Ahora los casilleros emergen vacíos de *todos* los métodos activos de la sucursal, requiriendo validación por método y no asumiendo Cero automágicamente antes de presionar `Cerrar Caja`.

## Explicación Didáctica
Antes de esta actualización, tratar de "Cerrar la Caja" era como que te pidieran contar dinero, pero no te dieran las planillas para anotar; entonces tocabas "Enviar" y automáticamente le decías al sistema "Tengo $0 en mano". ¡Eso generaba reportes catastróficos de -200 Mil (Faltantes irreales)!

Con esta reparación, el sistema primero le pregunta al corazón financiero (POS Api), "Che, ¿con qué cobrás vos?". "Con Efectivo y Tarjeta", le responde. Entonces, cuando el cajero quiere cerrar, la página despliega dos casilleros fijos (uno para Efectivo, otro Tarjeta) obligando al cajero a escribir la plata en mano antes de entregar la jornada.

A su vez, armamos tu "Historial", donde con un solo check podés investigar en la semana entera qué cajero tuvo **Sobrantes** (plata de más) o qué turnos registraron **Faltantes** en rojo profundo desde una solapa visual amigable, como ver tickets de compra de MercadoLibre.
