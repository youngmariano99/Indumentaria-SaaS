# Feature: Trazabilidad Financiera en Movimientos de Saldo

- **Fecha y Hora:** 2026-03-03 18:40
- **Tipo de Cambio:** Mejora de Arquitectura / Integridad de Datos
- **Módulo:** #Modulo_CRM
- **Área:** #Area_Backend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción
Se modificó el motor de movimientos de saldo de clientes para permitir la asociación de un Método de Pago a los ajustes manuales. Esta mejora es crítica para el módulo de Arqueo de Caja, ya que permite distinguir ingresos/egresos manuales por canal financiero.

## Detalle Técnico
1.  **Entidad `MovimientoSaldoCliente`**: Se agregó la propiedad `MetodoPagoId` (Guid opcional) y su navegación correspondiente.
2.  **Command Handlers**:
    - `AgregarSaldoClienteCommand`: Ahora recibe `MetodoPagoId` opcional y lo persiste en el movimiento generado.
    - `DescontarSaldoClienteCommand`: (Ídem) Permite trazar la salida de fondos o cancelaciones de deuda con un método específico.
3.  **Persistencia**: La relación permite que consultas futuras de arqueo puedan agrupar movimientos de saldo junto con las ventas por `MetodoPagoId`.

## Explicación Didáctica
Es como agregarle una etiqueta de "Cómo pagó" a cada anotación manual que hacemos en la cuenta del cliente. Si el cliente nos dio plata, anotamos si entró a la caja fuerte (Efectivo) o a la cuenta bancaria (Transferencia). Sin esto, el "dueño" del local no sabría por qué le falta o le sobra plata en el cajón al final del día.

Archivos clave:
- `MovimientoSaldoCliente.cs`: Nueva estructura de datos.
- `AgregarSaldoClienteCommand.cs`: Lógica de persistencia de ingreso manual.
- `DescontarSaldoClienteCommand.cs`: Lógica de persistencia de egreso manual.
