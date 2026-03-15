📋 PROMPT 1: Arquitectura de Base de Datos y Cuentas por Pagar (Backend)
ROLES Y CONTEXTO
Actúa como Arquitecto de Base de Datos y Desarrollador Senior en .NET 8. Estamos construyendo el módulo de Proveedores y Cuentas por Pagar (AP) para un SaaS ERP Multi-Rubro usando PostgreSQL y Entity Framework Core 8.

Nuestro objetivo es lanzar un módulo estándar de carga manual ahora, pero dejar la base de datos preparada para un futuro "Módulo Premium" que usará Azure AI Document Intelligence para leer facturas mediante fotos.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR EN C#:

1. Esquema Financiero de Cuentas por Pagar (AP):

Crea las entidades VendorInvoice (Factura) y Payment (Pago), con su tabla intermedia InvoicePaymentAllocation.

Agrega un campo BalanceDue en VendorInvoice que se actualice atómicamente mediante Triggers en PostgreSQL (O(1)).

2. Preparación Estructural para OCR/IA (Future-Proofing):

En VendorInvoice, agrega los siguientes campos para el futuro módulo premium:

Source (Enum: Manual, AI_Parsed).

DocumentUrl (Para guardar la ruta de la foto en un S3/Blob).

RawMetadataJsonb (Campo JSONB nativo de Postgres para guardar en el futuro la respuesta cruda de Azure y cruzar datos si hay dudas).

ProcessingStatus (Enum: Draft, Processing_AI, Pending_Human_Review, Confirmed). Esto preparará el sistema para el flujo asíncrono.

3. Gestión de Cheques de Terceros (Contexto Argentina):

Crea la entidad ThirdPartyCheck tratándola como un activo financiero con una Máquina de Estados (FSM) para la columna Status: EN_CARTERA, ENTREGADO, DEPOSITADO, RECHAZADO.

4. Abastecimiento Multi-Rubro:

Para soportar "Ferretería", crea la entidad VendorItem (relación N:M entre Producto y Proveedor), guardando el VendorSku, costo específico y tiempo de entrega (LeadTimeDays).

Tu tarea: Escribe las clases de entidad en C# y la configuración del DbContext usando Fluent API, asegurando los índices B-Tree correctos y la configuración del campo JSONB.

📋 PROMPT 2: Funcionalidades "Killer" y Preparación de Servicios (Backend)
ROLES Y CONTEXTO
Actúa como Ingeniero de Rendimiento y Arquitecto en .NET 8. Necesitamos implementar las funcionalidades de extrema eficiencia para el módulo de Proveedores del SaaS, aplicando Arquitectura Limpia (Clean Architecture) para facilitar futuras integraciones de IA.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR EN C#:

1. Arquitectura de Puertos y Adaptadores (Para futura IA):

Crea una interfaz IInvoiceRecognitionService con un método Task<ParsedInvoiceDto> ProcessImageAsync(Stream image).

Crea una implementación "Dummy" o manual por ahora. El objetivo es que, en el futuro, solo tengamos que crear un AzureDocumentIntelligenceService que implemente esta interfaz y registrarla en el contenedor de dependencias, sin tocar la lógica central del módulo de compras.

Prepara un flujo asíncrono (usando System.Threading.Channels o simulando un Worker) para recibir la factura, cambiar el estado a Processing_AI y luego a Pending_Human_Review.

2. Importador Masivo de Listas de Precios (Ultra-Rápido):

Escribe un servicio que utilice NpgsqlBinaryImporter para volcar los datos de un CSV/Excel a una tabla temporal en memoria en milisegundos.

Ejecuta un comando SQL MERGE masivo que actualice los costos y recalcule automáticamente el precio de venta en la base de datos usando el margen configurado.

3. Generador de Órdenes de Compra Automáticas:

Escribe un BackgroundService que se ejecute diariamente escaneando el stock.

Aplica la fórmula del Punto de Reorden (ROP): Demanda Diaria * Lead Time + Stock de Seguridad.

Genera un Borrador de Orden de Compra automáticamente buscando el proveedor con menor costo, agrupando pedidos para superar el MinimumOrderAmount.

Tu tarea: Escribe las interfaces para la futura IA, el código del servicio de importación masiva usando Npgsql y el Background Worker del algoritmo ROP en C#.

📋 PROMPT 3: Interfaz Mutante, Teclado-Céntrica y Human-in-the-loop (React PWA)
ROLES Y CONTEXTO
Actúa como Especialista UX/UI y Frontend Senior en React. Estamos desarrollando la PWA del módulo de Compras y Proveedores. La interfaz debe adaptarse según el rubro, operar a la velocidad de un sistema de escritorio clásico, y dejar el esqueleto listo para un flujo de validación de OCR (Inteligencia Artificial) en el futuro.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR EN REACT:

1. Data Grid Teclado-Céntrica y Modo "Human-in-the-loop":

Diseña un componente de tabla editable (Data Grid) para cargar facturas a extrema velocidad.

Navegación iterativa total: Enter confirma y baja de fila, Flechas navegan entre celdas, Ctrl+Espacio abre autocompletado de productos.

Preparación para la IA: La grilla debe aceptar un prop initialData (que en el futuro será el JSON que devuelva Azure). Añade un estado visual de "Revisión" donde las celdas puedan pintarse sutilmente de amarillo si el nivel de confianza (Confidence Score) de la futura IA es bajo, obligando al empleado a confirmarlo con un "Enter".

Agrega un componente Dropzone oculto o inactivo llamado "Subir Foto de Factura (Próximamente)" para ir educando al usuario sobre el futuro módulo premium.

2. Mutación de UI por Rubro (Indumentaria vs. Ferretería):

Si el metadato del inquilino indica Indumentaria: Renderiza una matriz bidimensional (Grilla Talles vs. Colores) para comprar curvas completas.

Si es Ferretería: Habilita el panel de actualización masiva por multiplicador porcentual y el panel de "Productos Sustitutos" por proveedor.

3. Tablero Financiero (AP Dashboard):

Diseña un tablero Kanban interactivo que agrupe deudas en columnas: "Corriente", "Vencido 0-30", "Vencido +60". Permite actualizaciones optimistas al arrastrar o registrar pagos.

Tu tarea: Escribe el esqueleto de la Data Grid en React manejando el evento onKeyDown, el soporte para el estado de "Revisión de IA", y diseña la estructura visual del Dashboard Kanban financiero.

Con estos ajustes, el código que recibas va a tener las "tuberías" listas. El día que quieran habilitar el módulo de pago, será literalmente conectar el cable de Azure a la interfaz IInvoiceRecognitionService que ya existirá en el código, y prender el botón en React. Cero fricción, máxima rentabilidad.