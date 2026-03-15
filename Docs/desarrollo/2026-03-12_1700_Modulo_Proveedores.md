# Documentación de Módulo: Proveedores y Cuentas por Pagar (AP)

## Información General
- **Fecha**: 2026-03-12
- **Módulo**: #Modulo_Proveedores
- **Importancia**: #Importancia_Critica
- **Área**: #Area_Backend #Area_Frontend
- **Nivel de Seguridad**: #Nivel_Seguridad_Alto

## Explicación Didáctica
Este módulo gestiona la relación con los proveedores de la empresa. Su arquitectura está "preparada para el futuro", permitiendo que hoy carguemos facturas manualmente de forma muy rápida mediante el teclado, pero dejando lista la "tubería" para que mañana una IA (Azure) lea las fotos de las facturas automáticamente. 

Hemos implementado una lógica de **Mutación de Rubro**: el sistema no se ve igual para una tienda de ropa que para una ferretería. La tienda de ropa compra "curvas" de talles (ej. 5 remeras Negras M), mientras que la ferretería actualiza precios masivamente por porcentajes. Todo esto corre sobre una base de datos PostgreSQL optimizada con importadores binarios que pueden procesar miles de precios en milisegundos.

## Arquitectura y Componentes

### Backend (Clean Architecture)
1.  **Entidades**: 
    - `Proveedor`: Datos maestros del vendedor.
    - `FacturaProveedor`: Soporta campos `MetadatosRawJsonb` para guardar la lectura de la IA.
    - `ChequeTercero`: Implementa una máquina de estados para el ciclo de vida del cheque.
    - `ProveedorProducto`: Relación N:M que guarda el `VendorSku` y el `Costo`.
2.  **Servicios de Tubería**:
    - `IReconocimientoFacturaService`: Interfaz para futura integración con Azure AI Document Intelligence.
    - `ImportadorMasivoPreciosService`: Usa `NpgsqlBinaryImporter` para volcar CSVs directamente a tablas temporales de Postgres.
    - `PuntoReordenWorker`: Background service que calcula el ROP diariamente para generar sugerencias de compra.

### Frontend (React PWA)
1.  **Data Grid de Alta Velocidad**: Implementado en `CargaFacturaPage.tsx`, permite navegar con flechas y cargar ítems con `Enter`, minimizando el uso del mouse.
2.  **UI Mutante**: El componente `RubroMutationPanel` detecta el tipo de negocio y ofrece herramientas específicas (Matriz de Talles vs Multiplicador Ferretero).
3.  **Dashboard AP (Kanban)**: Un tablero visual que organiza las deudas por su estado de vencimiento (Corriente, Vencido 0-30, Vencido +60).

## Pasos de Implementación (Bitácora)
1.  **Backend**: Creación de entidades y registro en `ApplicationDbContext`.
2.  **Backend**: Implementación de servicios de infraestructura y registro en `Program.cs`.
3.  **Frontend**: Creación de estructura de carpetas `features/providers`.
4.  **Frontend**: Desarrollo de páginas de listado, carga de facturas y tablero Kanban.
5.  **Frontend**: Integración de lógica de rubro dinámica.

## Tags
#Modulo_Proveedores #Importancia_Critica #Area_Backend #Area_Frontend #Clean_Architecture #IA_Ready #PostgreSQL_BinaryImport
