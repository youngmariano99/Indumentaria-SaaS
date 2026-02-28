#Modulo_CRM #Importancia_Titular #Area_Frontend #Nivel_Interfaz

# Feature: Módulo Cliente 360 y CRM (Frontend)

## Detalles Generales
- **Fecha y Hora**: 2026-02-28 19:05
- **Tipo de Cambio**: Nueva Función

## Impacto en Multi-tenancy
- El front delega la contención del multi-tenant a la inclusión habitual del Bearer JWT Token que se resuelve en `apiClient`.

## Detalle Técnico
- **Arquitectura**: Se creó el wrapper `clientesApi.ts` para conectar con el backend y tipar firmemente los Data Transfers Objects (Dto).
- **Ruteo y Navegación**: Se inyectaron rutas nuevas protegidas `AppLayout` en `router.tsx` (`/clientes` y `/clientes/:id`) para mostrar la grilla y el perfil extendido respectivamente. Enlace directo al Menú Lateral.
- **Grilla y ABM**: La interfaz `ClientesPage.tsx` funciona como un catálogo administrable. Su buscador procesa en memoria DNI, nombre y email, y delega creaciones a un Modal integrado. 
- **Perfil 360 Avanzado**: `PerfilClientePage.tsx` grafica los KPIs del Cliente en base al DTO de Backend (Compras totales, Ticket promedio, Última Visita, etc.), junto al desglose de los últimos 10 tickets impresos de este usuario, emulando la interfaz clásica de un ERP/CRM corporativo moderno.
- **Integración POS**: Modificaciones transversales a `PosPage.tsx` para llamar en paralelo al catalogo, metodos de pago y ahora **su cartera de clientes** al iniciar, inyectándolo en un Selector dropdown del lado derecho, para atar el cliente al Payload de la Venta.

## Explicación Didáctica
- El nuevo Perfil 360 funciona como una "Radiografía del Consumidor": el usuario dueño del negocio entra a esta pantalla y ve un resumen financiero clarísimo de qué tan valioso es su ciente, sus datos de contacto actualizados y si compra con regularidad.
- El POS antes era como una "Caja Registradora tonta y vacía" que tiraba precios, ahora adquirió "memoria y relación pública". Antes de aceptar cobrarte un fajo de billetes, ahora puede preguntar opcionalmente "A nombre de quién?" y mandarle esa tarjeta personal vinculada a la plata al servidor.
