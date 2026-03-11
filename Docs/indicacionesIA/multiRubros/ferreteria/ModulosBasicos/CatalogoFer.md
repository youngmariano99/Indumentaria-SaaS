Actúa como un Arquitecto de Software Principal y Desarrollador Full-Stack Senior. Estamos construyendo el módulo de CATÁLOGO para el rubro "Ferretería" dentro de nuestro SaaS Multi-Todo (.NET 8, PostgreSQL con JSONB, React PWA).

El objetivo de este sprint es lograr una eficiencia extrema en la carga de datos. Una ferretería maneja miles de artículos y variantes técnicas, por lo que la experiencia de usuario (UX) debe basarse en la velocidad, emulando la rapidez de un Excel pero con la robustez de una base de datos relacional.

DIRECTRICES ESTRICTAS DE DESARROLLO QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): INICIALIZACIÓN Y CARGA MASIVA

Seed Data Dinámico (Atributos Pre-cargados): Escribe un DomainEventHandler o servicio de inicialización que, cuando se crea un Inquilino (Tenant) con el rubro "Ferretería", inyecte automáticamente en su configuración (JSONB) los atributos técnicos base:

Unidades: Pulgadas, Milímetros, Metros, Litros, Kilos.

Materiales: Acero Inoxidable, Zincado, Bronce, PVC.

Presentación (Crucial): Unidad, Fracción, Blister, Caja x50, Caja x100.

Motor de Importación Batch (Excel/CSV): Crea un comando MediatR (ImportarCatalogoFerreteriaCommand) optimizado para procesar miles de filas. Debe soportar "Upsert" (Crear o Actualizar si el SKU/Código ya existe). Debe mapear dinámicamente columnas del Excel hacia el campo AtributosJson (ej. mapear la columna "Medida" al JSON).

2. FRONTEND (React): UX DE ALTA VELOCIDAD Y MATRIZ TÉCNICA

Formulario de Divulgación Progresiva: Diseña el componente de alta de producto (NuevoProductoForm) en dos pasos para evitar la fatiga cognitiva:

Paso 1 (Limpio): Solo pide "Nombre", "Categoría" y un Switch booleano: "¿Es artículo único o tiene medidas/presentaciones?".

Paso 2 (Matriz Técnica): Si tiene variantes, muestra el "Generador Combinatorio".

Generador Combinatorio Ferretero: Crea un componente React que permita al usuario seleccionar atributos (ej. Medida y Presentación). Si elige medidas [1/2", 3/4"] y presentaciones [Suelto, Caja x100], el componente debe generar instantáneamente en memoria un array de 4 variantes cruzadas.

Edición Estilo Planilla (Grid Editing): Para renderizar las variantes generadas, NO uses formularios modales individuales. Crea un componente VariantGridEditor similar a una hoja de Excel.

Requisito de UX: El usuario debe poder navegar por las celdas de "Stock" y "Precio" usando las flechas del teclado (Arriba/Abajo).

Requisito de Eficiencia: Incluye un botón "Aplicar a todos" para copiar un Precio Base a todas las variantes hacia abajo en un solo clic.

3. RESTRICCIONES DE ARQUITECTURA (Metadata-Driven UI)

NO utilices condicionales duros en React como if (rubro === 'ferreteria').

El frontend debe renderizar la grilla de atributos y los campos de "Medida" y "Material" leyendo la configuración del Schema Registry que envía el backend. El componente debe ser un "receptor ciego" (FieldFactory) que dibuja inputs basándose en la configuración del inquilino actual.