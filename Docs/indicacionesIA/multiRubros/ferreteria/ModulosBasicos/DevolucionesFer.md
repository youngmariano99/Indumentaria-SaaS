Actúa como un Arquitecto de Software Principal y Diseñador de UX B2B. Estamos desarrollando el módulo de DEVOLUCIONES Y CAMBIOS (RMA) para el rubro "Ferretería" dentro de nuestro SaaS POS (.NET 8, PostgreSQL, React PWA).

A diferencia del rubro indumentaria, las devoluciones en ferretería exigen manejar cantidades decimales, categorizar el estado del artículo devuelto (bueno vs. roto) y gestionar saldos a favor (Notas de Crédito).

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): LÓGICA DE TRANSACCIONES Y ESTADO DE STOCK

Comando de Devolución: Crea un comando ProcesarDevolucionCommand. Este endpoint debe recibir el ID del ticket original, los productos a devolver con sus cantidades (soportando tipo decimal para fracciones) y el Destino del Stock.

Separación Lógica de Inventario: Modifica (o extiende) la lógica de inventario para que el stock devuelto pueda sumarse a StockActual (si está apto para reventa) o a una nueva columna/tabla lógica de StockDefectuoso (para gestionar garantías con proveedores).

Generación de Saldo (Nota de Crédito): Si el cliente no pide reembolso en efectivo, el sistema debe crear una entidad MovimientoCuentaCorriente con saldo positivo a favor del cliente, vinculando el ID de la devolución.

2. FRONTEND (React): UX DE MOSTRADOR PARA DEVOLUCIONES RÁPIDAS

Buscador de Tickets: En el POS, agrega una pestaña o modal de "Devoluciones". El cajero debe poder escanear o tipear el número de ticket original para cargar la venta en pantalla.

Selección Fraccionada y Motivo: Diseña una tabla iterativa (ReturnItemsGrid). Para cada ítem del ticket, el usuario debe poder marcar "Devolver", ingresar la Cantidad (con soporte decimal) y seleccionar en un menú desplegable muy rápido el Motivo/Destino (ej. "Sobrante de Obra -> Vuelve a Stock", "Falla de Fábrica -> Va a Garantía").

Resolución Financiera: Al confirmar, el modal debe ofrecer dos botones grandes: "Devolver Efectivo/Tarjeta" o "Dejar Saldo a Favor (Nota de Crédito)".