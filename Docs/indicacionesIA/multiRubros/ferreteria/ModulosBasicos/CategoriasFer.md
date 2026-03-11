Actúa como un Arquitecto de Software Principal. Estamos diseñando el módulo de CATEGORÍAS para el rubro "Ferretería" en nuestro SaaS Multi-Inquilino (.NET 8, PostgreSQL JSONB, React PWA).

A diferencia de la indumentaria, la taxonomía ferretera es un árbol profundo (N-niveles) y necesitamos implementar el patrón de Herencia de Atributos (Attribute Inheritance) para lograr una eficiencia extrema en la carga de productos.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): ENTIDAD CATEGORÍA COMO PLANTILLA

Estructura Jerárquica: La entidad Categoria debe ser autorreferencial (tener un ParentId nulo para raíces, y una colección de SubCategorias).

Esquema de Atributos (El Secreto): Agrega una columna EsquemaAtributosJson (tipo JSONB en Postgres) a la entidad Categoria. Este campo no guarda el valor del atributo, sino la definición (ej. [{"nombre": "Material", "tipo": "lista", "opciones": ["Acero", "Bronce"]}]).

Lógica de Herencia: Crea un servicio en C# (CategoriaService.ObtenerEsquemaHeredadoAsync) que, dado un CategoriaId, suba por el árbol hasta la raíz y combine (merge) todos los EsquemaAtributosJson. Así, un "Taladro" hereda los requerimientos de "Herramienta Eléctrica".

2. FRONTEND (React): UX DE ÁRBOL Y CREACIÓN "AL VUELO"

Componente de Árbol (TreeView): Diseña un componente CategoryTreeView que renderice la estructura jerárquica de forma visual (como carpetas anidadas). Debe permitir expansión/colapso.

Creación Rápida Inline: Dentro del formulario de "Nuevo Producto", el selector de categorías (CategorySelect) debe incluir la capacidad de crear una categoría hija sin abandonar la vista actual (modal o input en línea).

Metadata-Driven UI (React): Cuando el usuario selecciona una categoría en el formulario de producto, el frontend debe hacer un fetch del EsquemaAtributosJson de esa categoría y renderizar dinámicamente los inputs adicionales que requiere (ej. si elige "Pinturas", que aparezca mágicamente el input "Litros").