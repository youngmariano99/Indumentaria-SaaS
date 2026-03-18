# Mapa de Módulos y Capacidades

Este documento detalla los módulos que componen el ecosistema de Indumentaria-SaaS y su propósito dentro de la cadena de valor del negocio.

---

## 📦 1. Catálogo y Matriz de Productos
El núcleo del sistema. Diseñado para manejar la complejidad de variantes.
- **Estructura**: Modelo Padre-Hijo. Un producto puede tener infinitas variantes (combinaciones de Talle/Color/Material).
- **Inventario**: Control de stock por variante y por sucursal. Soporte para stock decimal (ferreterías) y entero (indumentaria).
- **Categorización**: Árbol jerárquico de categorías con herencia de metadatos.

## 🛒 2. Punto de Venta (POS) y Arqueo
Optimizado para la velocidad en el mostrador.
- **Transaccionalidad**: Garantiza que si el cobro falla, el stock no se descuenta.
- **Multicanal**: Soporte para múltiples métodos de pago en una sola venta (efectivo + transferencia).
- **Arqueo de Caja (Operación Ciega)**: Los cajeros declaran el efectivo al cerrar sin ver el saldo esperado del sistema, garantizando la honestidad. El sistema genera un reporte de **Sobrantes/Faltantes**.
- **Historial de Cierres**: Trazabilidad completa por usuario, sucursal y fecha.

## 🖨️ 3. Motor de Impresión y Etiquetado
Infraestructura versátil para cualquier hardware.
- **Tickets POS**: Emisión de comprobantes térmicos de 58mm/80mm vía ESC/POS.
- **Etiquetas de Producto**: Generación dinámica de códigos de barras (CODE128) y QR.
- **Formatos**: Soporte para impresoras térmicas (Zebra, Brother) y hojas A4 (hojas autoadhesivas troqueladas).
- **Aislamiento CSS**: Lógica de impresión que oculta la UI de la web para que el papel solo reciba la etiqueta.

## 👥 4. CRM y Fidelización
Más que una lista de contactos, es un historial financiero.
- **Cuenta Corriente**: Gestión de saldos a favor y deudas.
- **Perfil 360**: Visualización de todas las compras, devoluciones y pagos de un cliente en una sola línea de tiempo.
- **Devoluciones Inteligentes**: La "Balanza Mágica" que compensa valores entre lo que el cliente devuelve y lo que lleva nuevo.

## 🚚 4. Proveedores y Compras
Gestión del flujo de entrada de mercadería.
- **Facturación Operativa**: El registro de una factura de compra aumenta automáticamente el stock y actualiza el costo de los productos.
- **Cuentas por Pagar**: Seguimiento de deudas con proveedores y emisión de pagos (efectivo, transferencias, cheques).

## 🛡️ 5. Gestión de Equipo y Sedes
Control administrativo y de seguridad.
- **Roles**: Owner, Manager, Cashier, Auditor.
- **Permisos Granulares**: El Dueño puede apagar/encender módulos específicos para cada empleado.
- **Cambio de Turno**: Sistema de PIN de 4 dígitos para turnos rápidos en caja.
- **Multi-Sucursal**: Gestión de múltiples locales físicos y depósitos.

## 📊 6. Analytics y Dashboard
Vista de pájaro del negocio.
- **KPIs**: Ventas del día, rentabilidad por rubro, productos más vendidos.
- **Alertas**: Notificaciones de stock bajo mínimos configurables.

---

## 🔗 Interconexiones Críticas
1. **Venta -> Inventario**: Descuento inmediato de stock físico al confirmar ticket.
2. **Factura Proveedor -> Catálogo**: Actualización de "Último Precio de Compra" para sugerir nuevos precios de venta.
3. **Devolución -> CRM**: Generación automática de saldo a favor si hay diferencia de precio.
