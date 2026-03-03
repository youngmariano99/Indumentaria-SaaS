# Feature: Atributos Específicos por Variante

- **Fecha y Hora:** 2026-03-03 18:10
- **Tipo de Cambio:** Nueva Función
- **Módulo:** #Modulo_Catalogo
- **Área:** #Area_Frontend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción
Se amplió la matriz de creación de productos para permitir que cada combinación de talle/color (variante) tenga características únicas (ej: Estampas diferentes, materiales específicos, etc.). Anteriormente, los atributos adicionales eran globales para todo el producto.

## Detalle Técnico
1.  **Modelo de Datos**: Se actualizó el tipo `FilaVariante` para incluir un objeto `atributos: Record<string, string>`.
2.  **Interfaz de Usuario**:
    - Se agregó una columna de "Detalles" en la tabla de variantes.
    - Se implementó un **Modal de Detalles** que permite añadir/quitar pares clave-valor específicos para cada fila.
    - Se actualizó la carga matricial para persistir estos datos al guardar o editar.
3.  **Lógica de Fusión**: Al enviar al backend, se combinan los atributos globales del producto con los específicos de cada variante, teniendo prioridad los específicos.

## Explicación Didáctica
Imagina que estás cargando una remera que viene en Negro y Blanco. Antes, si ponías "Estampa: Dragon", todas las remeras (negras y blancas) tenían dragones. 
Ahora, el sistema te deja entrar al detalle de la remera Negra y ponerle "Estampa: Dragon", y a la Blanca ponerle "Estampa: Fénix". Cada variante es ahora "inteligente" y puede tener su propia personalidad sin mezclarse con las demás.

Archivos clave:
- `NuevoProductoPage.tsx`: Lógica de matriz y modal.
- `types/index.ts`: Definición del modelo de datos de variantes.
