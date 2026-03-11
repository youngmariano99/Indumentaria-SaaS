---
Tags: #Modulo_Catalog, #Importancia_Alta, #Area_Backend, #Nivel_SaaS_2.0
---

# Feature: UI Mutante - Backend Metadata-Driven

**Fecha y Hora:** 2026-03-10 21:30
**Tipo de Cambio:** Refactor Arquitectónico

## Propósito
Transformar la API de autenticación y catálogo para soportar una interfaz definida por metadatos. El objetivo es que el frontend no tenga campos hardcodeados, sino que los construya según el esquema JSON definido en el rubro.

## Impacto en Multi-tenancy
- **Desacoplamiento Total:** El frontend ya no necesita conocer las propiedades específicas de cada industria (ej. no sabe qué es un "EAN13" o "PesoKg"), solo sabe renderizar lo que el backend le indica.
- **Login Extendido:** El `LoginResponse` ahora transporta el `EsquemaMetadatosJson` y el `DiccionarioJson` del rubro, permitiendo que la App se autoconfigure en milisegundos tras autenticarse.

## Detalle Técnico
1. **Refactor `LoginResponse`:** Inclusión de propiedades de configuración del rubro.
2. **AuthController:** Integración de `.Include(i => i.Rubro)` para cargar los metadatos en el flujo de login.
3. **Persistencia Flexible:** Cambio en los comandos de creación/edición para usar `MetadatosJson` (string JSON) en lugar de campos planos.

---

## Explicación Didáctica
Le dimos al sistema la capacidad de **auto-describirse**. 
Antes, cuando un usuario entraba, el sistema le decía: "Hola, sos de una tienda de ropa". Y el frontend tenía que adivinar qué campos mostrar. 
Ahora, el sistema le dice: "Hola, sos de una tienda de ropa, y acá tenés el manual de cómo tiene que verse tu pantalla de carga de productos". 
El frontend simplemente sigue las instrucciones del manual. Si mañana creamos un rubro de "Farmacia", solo cambiamos el manual en la base de datos y la pantalla cambiará sola sin tocar una sola línea de código React.

Archivos clave:
- `LoginResponse.cs`: El "sobre" que ahora trae el manual de instrucciones.
- `AuthController.cs`: Quien mete el manual en el sobre al iniciar sesión.
- `Producto.cs`: Ahora guarda toda la información variable en una "caja negra" (JSONB) llamada Metadatos.
