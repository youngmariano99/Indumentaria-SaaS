# Catalog: Soporte para Carga Masiva (Batch)

- **Fecha y Hora:** 2026-03-03 09:50
- **Tipo de Cambio:** Nueva Función
- **Importancia:** #Importancia_Alta
- **Módulo:** #Modulo_Catalog
- **Área:** #Area_Backend
- **Nivel de Seguridad:** #Nivel_Seguridad_Estandard

## Descripción
Se implementó un nuevo endpoint y comando para la carga masiva de productos y sus variantes en un solo lote (batch). Esto es fundamental para el **Sprint 4.3 (Carga Masiva Pro)**, permitiendo a los comerciantes subir inventarios grandes de forma eficiente y segura.

## Impacto en Multi-tenancy
El comando `CrearProductosBatchCommand` utiliza el `ITenantResolver` para garantizar que todos los productos y variantes creados pertenezcan exclusivamente al inquilino autenticado. Toda la operación se realiza dentro de una única transacción ACID por batch.

## Detalle Técnico
- **Nuevo Comando:** `CrearProductosBatchCommand` en `Application/Features/Catalog/Commands/`.
- **Nuevo Endpoint:** `POST /api/productos/batch` en `ProductosController.cs`.
- **Transaccionalidad:** Uso de `Database.BeginTransactionAsync()` para asegurar que se creen todos los productos o ninguno en caso de fallo.
- **Validación:** Límite máximo de 500 productos por cada petición para proteger la salud del servidor.

## Explicación Didáctica
Imaginen que antes, para cargar 10 productos, el empleado tenía que ir 10 veces al depósito a dejar una caja por vez (10 peticiones HTTP individuales). Con esta mejora, el empleado carga un camión con las 10 cajas y hace un solo viaje (1 petición batch). Si el camión pincha una rueda, todas las cajas vuelven al punto de origen para asegurar que no se pierda nada ni quede mercadería a mitad de camino (Transacción ACID).

Archivos clave:
- `CrearProductosBatchCommand.cs`: El motor que procesa la lista de productos.
- `ProductosController.cs`: La ventanilla que recibe el "camión" de datos.
