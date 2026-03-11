Actúa como Arquitecto de Software Principal y Analista Financiero B2B. Estamos adaptando los módulos de ARQUEO DE CAJA y REPORTES en nuestro SaaS Multi-Rubro (.NET 8, PostgreSQL, React PWA) para soportar la operativa de una "Ferretería".

Aunque la base matemática de la caja es universal, la ferretería introduce flujos de dinero asíncronos (Cuentas Corrientes, Acopios) y requiere reportes enfocados en la reposición y la inflación, alejándose de los reportes estacionales de la indumentaria.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): ARQUEO Y CUENTAS CORRIENTES

Separación de Flujos en Caja: En el modelo de TurnoCaja o Arqueo, asegúrate de que existan propiedades distintas para contabilizar VentasDelDiaEfectivo vs CobranzasCuentaCorrienteEfectivo. El dinero que ingresa por pago de deudas previas no debe inflar el reporte de ventas del día, pero sí debe sumar al total del cajón físico.

Entidad MovimientoCuentaCorriente: Crea o adapta esta entidad para registrar créditos (ventas fiadas) y débitos (pagos del cliente). Debe estar vinculada al TenantId y al ClienteId.

2. REPORTES FINANCIEROS Y LOGÍSTICOS (PostgreSQL + .NET)

Query de Valorización de Inventario: Crea un endpoint que calcule el valor total del inventario. La fórmula estricta debe ser SUM(StockActual * PrecioCosto) agrupado por Categoría. Debe ser extremadamente eficiente usando los índices actuales.

Query de Punto de Reorden: Crea un reporte (GetProductosBajoStockQuery) que filtre los registros donde StockActual <= StockMinimo. Este reporte debe devolver los metadatos necesarios del JSONB (ej. Nombre, Medida, Material) para que el ferretero sepa exactamente qué pedir.

Reporte de Deudores (Aging Report): Crea un endpoint que devuelva la lista de clientes con saldo negativo, ordenados por monto adeudado y días de antigüedad de la deuda.

3. FRONTEND (React): UX DE CIERRE Y TABLEROS

Dashboard de Caja: En la pantalla de Arqueo, el componente visual debe tener dos columnas claras: "Ingresos por Ventas" e "Ingresos por Cobranzas de Deudores". Esto evitará ataques de pánico en el cajero cuando la plata física sea mucho mayor a las ventas del día.

Vistas de Reportes Dinámicas: Implementa el patrón Metadata-Driven UI para los reportes. Si el Tenant tiene el rubro "Ferretería", el menú de reportes debe ocultar los gráficos de "Ventas por Temporada/Color" y mostrar prominentemente el "Ranking de Deudores" y "Alertas de Reposición".