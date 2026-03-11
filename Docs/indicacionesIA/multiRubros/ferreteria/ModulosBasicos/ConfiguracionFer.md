Actúa como un Arquitecto de Software Principal. Estamos diseñando el módulo de CONFIGURACIÓN DE ATRIBUTOS para nuestro SaaS Multi-Rubro (.NET 8, PostgreSQL, React PWA).

En el rubro "Indumentaria", configurábamos Talles y Colores. Para "Ferretería", configuraremos Medidas, Materiales y Presentaciones. Para lograr que el SaaS soporte cualquier rubro futuro sin cambiar la base de datos, debemos implementar un "Diccionario de Atributos Genérico".

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. BACKEND (.NET 8): DICCIONARIO UNIVERSAL Y PROTECCIÓN

Entidad Genérica: Crea la entidad AtributoConfiguracion con los campos: Id, TenantId, Grupo (ej. "Medida", "Material", "Talle"), Valor (ej. "1/2 pulgada", "Acero", "XL") y Orden.

Lógica de Protección: Crea un comando/servicio para eliminar atributos (EliminarAtributoCommand). Antes de eliminar, debe consultar (mediante JSONB o relación) si algún ProductoVariante activo está utilizando ese valor. Si está en uso, debe lanzar una excepción de dominio clara o aplicar un Soft Delete (IsActive = false).

Seed Data Inyectado: Crea un manejador que, al registrar un nuevo Tenant con el rubro "Ferretería", inserte masivamente las listas estándar en la tabla AtributoConfiguracion (ej. Grupo "Presentacion": Unidad, Blister, Caja x50).

2. FRONTEND (React): UX DE ETIQUETAS (CHIPS) Y CREACIÓN AL VUELO

Interfaz de Configuración (Tag Manager): Diseña un componente AttributeGroupManager. Debe recibir el Grupo por props. Visualmente debe renderizar los valores existentes como "Chips/Pills" con una 'X' para eliminar. Debe tener un input de texto rápido donde el usuario escriba, presione Enter y el chip se agregue instantáneamente (optimistic UI).

Selector Creativo en el Formulario (Creatable Select): En el formulario de Crear Producto, el componente desplegable de atributos (CreatableAttributeSelect) debe permitir seleccionar opciones del diccionario. Si el usuario escribe una opción que no existe (ej. "Goma"), el componente debe permitir seleccionarla, usarla y disparar una petición en segundo plano para guardarla en la configuración general para el futuro.