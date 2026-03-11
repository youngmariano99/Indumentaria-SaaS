Actúa como un Arquitecto de Software Principal y Experto en UI/UX Transaccional. Estamos desarrollando el módulo POS (Punto de Venta) para el rubro "Ferretería" en nuestro SaaS (.NET 8, PostgreSQL, React PWA).

A diferencia del POS de indumentaria, el mostrador ferretero exige velocidad extrema en búsquedas complejas (miles de variantes) y el manejo fluido de cantidades fraccionadas (decimales).

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): BÚSQUEDA ULTRARRÁPIDA MULTICAMPO

Query de Búsqueda Difusa: Crea un endpoint (BuscarProductosPosQuery) optimizado para PostgreSQL. La búsqueda debe cruzar el término ingresado tanto en la columna Nombre como dentro de los valores del campo AtributosJson (ej. buscar "1/2" dentro del JSON de medidas).

Uso de Trigramas: Asegúrate de que la query utilice métodos compatibles con la extensión pg_trgm (como EF.Functions.ILike o los operadores de texto completo de Postgres) para tolerar errores tipográficos sin degradar el rendimiento.

2. FRONTEND (React): UX DE MOSTRADOR Y FRACCIONAMIENTO

Buscador Inteligente (Omnibar): El input principal del POS debe escuchar tanto el lector de códigos de barras como el tipeo manual. Implementa un debounce de 300ms para no saturar la API mientras el usuario teclea "codo 1/2".

Flujo de Cantidad Decimal: Al seleccionar un producto en la búsqueda, el componente debe leer sus metadatos (EsFraccionable).

Si es false (ej. un martillo), lo suma al carrito con cantidad 1.

Si es true (ej. cable), abre un pequeño popover o hace foco en un input para que el usuario ingrese la cantidad decimal (ej. 1.5) antes de sumarlo.

Ítem "Comodín" (Artículo Vario): Crea un flujo rápido (un botón en la UI) que permita agregar un "Ítem Vario" al carrito, pidiendo únicamente el Monto Total, sin necesidad de buscar en la base de datos, para resolver ventas de mostrador no catalogadas.