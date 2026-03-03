# Feature: Métodos de Pago en Ajustes Manuales de Saldo

- **Fecha y Hora:** 2026-03-03 18:40
- **Tipo de Cambio:** Nueva Función / Mejora Operativa
- **Módulo:** #Modulo_CRM #Modulo_POS
- **Área:** #Area_Frontend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción
Se integró la selección de métodos de pago en el proceso de ajuste manual de saldo de clientes. Esto permite que cuando un cliente deja dinero a cuenta (Ingreso) o se retira dinero (Egreso) manualmente desde el perfil, el sistema registre cómo se movió ese dinero para no quebrar el arqueo de caja.

## Detalle Técnico
1.  **Integración de API**: Se conectó `PerfilClientePage.tsx` con `posApi.obtenerMetodosPago` para cargar las opciones reales configuradas por el tenant (Efectivo, Transferencia, Tarjeta, etc.).
2.  **Interfaz de Usuario**:
    - Se añadió un selector desplegable en el Modal de Saldo del Perfil 360.
    - El selector es obligatorio para asegurar que cada movimiento manual tenga una contrapartida financiera clara.
3.  **Lógica de Envío**: Se actualizaron las llamadas a `clientesApi` para enviar el `metodoPagoId` seleccionado al backend.

## Explicación Didáctica
Imagina que sos un cajero y un cliente viene y te deja $5000 a cuenta para el mes que viene. Antes, anotabas "el cliente tiene $5000" pero no anotabas si te los dio en billetes o por transferencia. Al final del día, tu caja física no coincidía con lo que decía la computadora. 
Ahora, el sistema te obliga a marcar qué medio usó, para que cuando hagas el recuento de billetes (arqueo), todo cierre perfecto.

Archivos clave:
- `PerfilClientePage.tsx`: Nuevo selector y lógica de carga de métodos.
- `api/clientesApi.ts`: Soporte para enviar el ID del método.
