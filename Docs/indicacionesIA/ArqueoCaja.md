# Estructura de Arqueo de Caja (IMPLEMENTADO)

1. El Motor de Datos: Entidad ArqueoCaja
Para evitar duplicidad y garantizar la soberanía de los datos por local, la entidad debe heredar de IMustHaveTenant.

Identificadores: Id (Guid), TenantId, StoreId (Sucursal) y UserId (Cajero responsable).

Saldos de Control: * Saldo Inicial: Efectivo con el que arranca la jornada.

Ventas Esperadas: Cálculo automático del sistema desglosado por MetodoPago (Efectivo, Débito, Crédito, QR).

Entradas/Salidas Manuales: Registros de gastos menores (ej. limpieza) o retiros de efectivo.

Validación Física: SaldoReal (lo que el cajero cuenta) y Diferencia (calculada automáticamente).

Estado: Abierto, Cerrado, Auditado.

2. Flujo Operativo Eficiente (UX/UI)
Siguiendo la estrategia de "Thumb Zone" (Zona del Pulgar), la interfaz debe ser operable con una sola mano en tablets.

Apertura de Caja: El sistema propone el saldo de cierre del día anterior. El cajero confirma o corrige.

Cierre Ciego (Estrategia Anti-Fraude): El cajero ingresa el monto físico que tiene frente a él sin que el sistema le diga cuánto debería haber. Esto obliga a un conteo real y honesto.

Conciliación Automática: Una vez ingresado el dato, el sistema revela la diferencia. Si es significativa, permite al cajero agregar una observación antes de cerrar.

3. Gestión de Contingencias y Problemas
Dado que el sistema es Offline-first, pueden surgir discrepancias si hay ventas locales que aún no subieron a la nube.

Advertencia de Sincronización: El sistema no permite cerrar el arqueo si el Sync Manager detecta tickets pendientes de subir. Esto evita "inventarios fantasma" o ventas que no aparecen en el reporte financiero.

Correcciones "En Caliente": Si el cajero cometió un error (ej. marcó como "Efectivo" algo que era "Débito"), el sistema debe permitir un Ajuste de Medio de Pago rápido que reclasifique la venta, dejando un registro de auditoría de quién hizo el cambio y por qué.

4. Auditoría y Seguridad Total
Para que el dueño del negocio tenga paz mental, el sistema utiliza las herramientas de seguridad ya implementadas:

Row Level Security (RLS): Garantiza que un usuario de una sucursal jamás pueda ver o alterar el arqueo de otra sede.

AuditLog (JSONB): Cada vez que se cierra una caja o se modifica un monto, el AuditInterceptor graba el estado anterior y el nuevo en formato JSONB. Esto permite ver exactamente qué cambió en un peritaje contable.

Idempotencia: Al igual que con ARCA, el cierre de caja usa transacciones ACID (BeginTransactionAsync); si hay un error de red al momento de cerrar, el sistema revierte los cambios para no dejar la caja en un estado inconsistente.

5. Configuración Fácil
El sistema debe ser adaptable a cada tipo de tienda mediante el módulo de Ajustes:

Medios de Pago Personalizados: El dueño define qué botones aparecen en el arqueo (ej. si acepta "Envío Ya" o "Modo").

Límites de Tolerancia: Configurar un monto de diferencia (ej. $100) que el sistema acepte automáticamente sin requerir una auditoría manual del gerente.

Alertas de Retiro: Configurar avisos para que, cuando el efectivo en caja supere cierto monto, el sistema sugiera un "Retiro de Caja" por seguridad.