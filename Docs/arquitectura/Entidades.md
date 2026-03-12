# Entidades del Sistema (Dominio) 🗃️

Las entidades están divididas por dominios, asegurando que el sistema sea modular y soporte multi-inquilinato nativo.

## 1. Núcleo de Multi-Inquilinato y Rubros
Define la identidad y el rubro del negocio.

### Rubro (Sector Vertical)
- **Campos:** `Id (Guid)`, `Nombre`, `Slug` (ej: "ferreteria"), `DiccionarioJson` (Terminología dinámica).
- **Propósito:** Define la "Personalidad Técnica" del inquilino.

### Tenant (Inquilino)
- **Campos:** `Id (Guid)`, `RubroId (FK)`, `NombreComercial`, `CUIT`, `ConfiguracionRegional`, `CreatedAt`.
- **Propósito:** El contenedor principal de datos. Aislado mediante RLS (Row Level Security).

### SubscriptionModule (Feature Flags)
- **Campos:** `Id`, `TenantId (FK)`, `ModuloKey` (Fiscal, MultiSucursal, etc.), `IsActive`.

## 2. Catálogo y Existencias
Adaptable dinámicamente según el rubro.

### Product (Estilo/Padre)
- **Campos:** `Id`, `TenantId (FK)`, `Nombre`, `Descripcion`, `CategoriaId`.

### ProductVariant (Variante/SKU)
- **Campos:** `Id`, `ProductId (FK)`, `SKU`, `PrecioOverride`.
- **Específicos Indumentaria:** `Talle`, `Color`.
- **Específicos Ferretería:** `UnidadMedida`, `Fraccionable`.

### Inventory (Existencias)
- **Campos:** `Id`, `TenantId (FK)`, `StoreId (FK)`, `ProductVariantId (FK)`, `StockActual`, `StockMinimo`.

## 3. Ventas y Módulo Fiscal
Integración crítica con alta seguridad.

### Invoice (Comprobante)
- **Campos:** `Id`, `TenantId (FK)`, `Tipo` (A, B, C, NC), `Estado`, `CAE`, `VencimientoCAE`, `Total`.

### InvoiceItem
- **Campos:** `Id`, `InvoiceId (FK)`, `ProductVariantId (FK)`, `Cantidad`, `PrecioUnitario`.

## 4. Clientes y Cuentas Corrientes
Gestión de deuda y fidelización.

### Customer (Cliente)
- **Campos:** `Id`, `TenantId (FK)`, `Documento`, `Nombre`, `Email`.

### Wallet (Cuenta Corriente / Billetera)
- **Campos:** `Id`, `CustomerId (FK)`, `SaldoActual`.

### WalletTransaction
- **Campos:** `Id`, `WalletId (FK)`, `Monto`, `Tipo` (Débito/Crédito).

## 5. Auditoría y Telemetría
### AuditLog (Global)
- **Campos:** `Id`, `TenantId (FK)`, `UserId (FK)`, `TableName`, `Action`, `OldValues (JSONB)`, `NewValues (JSONB)`.