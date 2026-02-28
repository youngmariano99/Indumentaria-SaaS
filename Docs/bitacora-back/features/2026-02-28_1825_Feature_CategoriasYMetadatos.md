#Modulo_Catalogo, #Importancia_Media, #Area_Backend, #Nivel_Seguridad

## Fecha y Hora
2026-02-28 18:25

## Tipo de Cambio
Nueva Función (Sprint 3.5)

## Impacto en Multi-tenancy
Todas las peticiones a Categorías y Productos respetan el `TenantId` del usuario autenticado, utilizando los filtros globales de Entity Framework Core para evitar fuga de datos entre inquilinos.

## Detalle Técnico
- **Base de Datos**: Se actualizó PostgreSQL con la nueva entidad `Categoria`, que incluye soporte para recursividad (`ParentId`), descripción técnica (`Ncm`) y soporte de eliminación lógica (`ISoftDelete`). Se añadieron los campos `PesoKg`, `Ean13`, `Origen` y `EscalaTalles` a la tabla `Productos`.
- **CQRS (MediatR)**:
  - `CrearCategoriaCommand`, `EditarCategoriaCommand`, `EliminarCategoriaCommand` (con validación de no eliminar si contiene subcategorías o productos), `ObtenerCategoriasQuery` (arma el árbol en memoria).
- **Controlador**: Se expuso `CategoriasController` con los endpoints RESTful estándar.

## Explicación Didáctica
- **¿Qué hace esto?**: Como si fuera el índice de un libro escolar, creamos un sistema de "Carpetas dentro de Carpetas" (Categorías jerárquicas). Esto nos permite agrupar productos como "Ropa -> Remeras -> Lisas".
- **¿Cómo lo hace?**: En la base de datos, cada categoría guarda quién es su "padre" (`ParentId`). Al pedirlas, el servidor las acomoda en un árbol (una estructura de ramitas) y se las entrega listas al Frontend. Además habilitamos que los productos ahora guarden más detalle logístico (como el código de barras y el peso), que será vital cuando integremos despachos de envíos.
