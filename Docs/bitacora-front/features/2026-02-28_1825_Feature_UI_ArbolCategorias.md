#Modulo_Catalogo, #Importancia_Media, #Area_Frontend, #Nivel_Seguridad

## Fecha y Hora
2026-02-28 18:25

## Tipo de Cambio
Nueva Función (Sprint 3.5)

## Impacto en Multi-tenancy
No aplica directamente, la UI recibe los datos filtrados por tenant desde el backend y envía el Bearer Token en cada request usando el `apiClient`.

## Detalle Técnico
- **Servicios**: Se creó `categoriasApi.ts` implementando llamadas al CRUD de categorías usando `apiClient`.
- **Componentes React**:
  - `CategoriasPage.tsx`: Pantalla principal de ABM de categorías que construye de forma recursiva (componente `CategoriaNode`) un árbol virtual en pantalla, permitiendo colapsar e interactuar (Añadir, Editar, Eliminar) con cada nivel.
  - `CategoriasPage.module.css`: Estilado de las anidaciones, animaciones hover, y modales de carga nativos de la vista.
- **Integración Catálogo**: Se mapearon los metadatos (Peso, Origen, etc) en `NuevoProductoPage.tsx`. Además, el selector de categorías carga y aplana la data del árbol de manera dinámica.
- **Rutas**: Se actualizó el sidebar global `AppLayout.tsx` agregando la sección de "Categorías", y se insertó la ruta `/categorias` en `router.tsx`.

## Explicación Didáctica
- **¿Qué hace esto?**: Le da al usuario una pantalla visualmente agradable y parecida al explorador de archivos de Windows para crear sus categorías. 
- **¿Cómo lo hace?**: Usa una técnica llamada "Recursividad" en React. Significa que el componente `CategoriaNode` se llama a sí mismo si detecta que la categoría tiene "hijos" (subcategorías), armando infinitas carpetas anidadas. Para mostrar esto en un menú simple al momento de crear un producto, aplanamos ese árbol en una lista usando guiones para marcar niveles (por ejemplo: "Remeras", "— Lisas", "— Estampadas").
