1. Núcleo de Multi-Inquilinato y Suscripción
Estas entidades controlan quién accede y qué módulos tiene activos (Modelo Fudo).

Tenant (Inquilino):

Id (Guid), NombreComercial, CUIT, ConfiguracionRegional, CreatedAt.

SubscriptionModule (Módulos Contratados):

Id, TenantId (FK), ModuloKey (Enum: Fiscal, MultiSucursal, Wallet, IA), IsActive, ValidUntil.


Propósito: Tu backend usará esto para habilitar/deshabilitar funcionalidades (Feature Flags).

UsageTelemetry (Telemetría para Cobro Híbrido):

Id, TenantId (FK), Métrica (Enum: FacturaEmitida, PrendaCargada), Cantidad, Mes, Año.


Propósito: Base para el cobro transaccional adicional a la suscripción base.

2. Estructura Organizacional y Seguridad
Store (Sucursal):

Id, TenantId (FK), Nombre, Direccion, EsDepositoCentral (bool).

User (Usuario/Staff):


Id, TenantId (FK), Nombre, Email, PasswordHash, PinCodeHash (para acceso rápido en POS), Rol.

3. Catálogo y Matriz de Stock (El Corazón del Negocio)
Diseñado para evitar el "inventario fantasma" y manejar la complejidad de talles/colores.

Product (Estilo/Padre):

Id, TenantId (FK), Nombre, Descripcion, PrecioBase, CategoriaId, Temporada.

ProductVariant (Variante/Hijo - Matriz):

Id, ProductId (FK), TenantId (FK), Talle, Color, SKU (Código de barras único), PrecioOverride.


Eficiencia: El producto padre guarda lo común; la variante solo lo específico.

Inventory (Existencias):

Id, TenantId (FK), StoreId (FK), ProductVariantId (FK), StockActual, StockMinimo.

Seguridad: Solo se modifica mediante transacciones de "Movimiento de Stock" para auditoría completa.

4. Módulo Fiscal y Ventas (Misión Crítica)
Aquí es donde aplicamos la máxima seguridad y la integración con ARCA.
+1

Invoice (Comprobante):

Id, TenantId (FK), StoreId (FK), Tipo (A, B, C, M, NC), Estado (Borrador, Autorizada, Error), CAE, VencimientoCAE, TotalNeto, TotalIva, Total.

InvoiceItem:

Id, InvoiceId (FK), ProductVariantId (FK), Cantidad, PrecioUnitario, IvaAlicuota.

DigitalCertificate (Sencible):


Id, TenantId (FK), KeyVaultReference (String: URL al certificado en Azure Key Vault para no guardarlo en la DB), ExpirationDate.

FiscalLog (Auditoría ARCA):

Id, TenantId (FK), InvoiceId (FK), Accion (Enum: WSAA_Token, WSFE_Autorizar), RequestJson (JSONB), ResponseJson (JSONB), Exitoso (bool), Timestamp.


Seguridad: El uso de JSONB permite guardar el XML/JSON exacto enviado y recibido para peritajes legales.

5. Clientes y Wallet (Fidelización y Devoluciones)
Customer (Cliente):


Id, TenantId (FK), Documento (DNI/CUIT), Nombre, Email, PreferenciasJson (Talles favoritos, etc.).

Wallet:

Id, TenantId (FK), CustomerId (FK), SaldoActual.

WalletTransaction:

Id, WalletId (FK), Monto, Tipo (Credito_Devolucion, Debito_Compra), InvoiceId (FK), Timestamp.

6. Sistema de Auditoría End-to-End
Para que tu sistema sea auditable de punta a punta y seguro:

AuditLog (Global):

Id, TenantId (FK), UserId (FK), TableName, PrimaryKey, Action (Insert, Update, Delete), OldValues (JSONB), NewValues (JSONB), IpAddress, Timestamp.

Propósito: Rastrear quién cambió qué y cuándo. Al usar JSONB, es fácil migrar si cambias de base de datos ya que es un estándar de facto.

Sugerencias para Eficiencia y Seguridad:
Row Level Security (RLS): En PostgreSQL, habilita RLS usando el TenantId. Esto garantiza que, incluso si hay un bug en tu código de C#, un cliente jamás verá datos de otro a nivel de base de datos.

Modularidad (Clean Architecture): Define estas entidades en un proyecto de "Core" o "Domain". No dependas de ninguna librería de base de datos aquí. Usa Interfaces para los repositorios. Así, cambiar de Postgres a otra DB es solo crear una nueva implementación en la capa de "Infrastructure".

Índices Compuestos: Crea índices que siempre comiencen con TenantId. Ejemplo: (TenantId, SKU) o (TenantId, CUIT). Esto hace que las búsquedas sean ultra eficientes en un entorno multi-inquilino.


Idempotencia en ARCA: Usa el campo FiscalLog para verificar si una factura ya fue enviada antes de reintentar, evitando duplicados ante caídas de red.