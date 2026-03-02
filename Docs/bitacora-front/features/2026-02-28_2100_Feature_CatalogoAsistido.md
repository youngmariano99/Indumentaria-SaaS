# Bitácora Front-End: Catálogo Asistido (Widget de Chat en Dashboard)

**Fecha y Hora:** 2026-02-28 21:00  
**Tipo de Cambio:** Nueva Función  
**Módulo:** Catálogo / Dashboard  
**Tags:** #Modulo_Catalogo, #Area_Frontend, #React, #Catalogo_Asistido

## Impacto en Multi-tenancy
- El widget no persiste datos propios; simplemente consulta el backend usando el `apiClient` que ya adjunta el JWT del usuario autenticado.
- Cualquier intento de consultar stock o ventas de otro tenant es bloqueado en la API, ya que los endpoints de catálogo asistido usan los filtros globales por `TenantId`.

## Detalle Técnico
1. **API Client (`catalogoAsistidoApi.ts`):**
   - Nuevos métodos:
     - `getStockBajo(umbral: number)` → `GET /api/catalogoasistido/stock-bajo?umbral=...`.
     - `getSinStock()` → `GET /api/catalogoasistido/sin-stock`.
     - `getTopVendidosSemana(topN?: number)` → `GET /api/catalogoasistido/top-vendidos-semana?topN=...`.

2. **Componente `CatalogoAsistidoWidget` (`features/catalog/CatalogoAsistidoWidget.tsx`):**
   - Obtiene el nombre del usuario desde `useAuthStore` y, al montarse, muestra un saludo:
     - _“Hola {nombre}, soy tu asistente de catálogo. ¿Querés consultar cómo estamos hoy?”_
   - Renderiza un pseudo-chat minimalista:
     - Burbujas de mensajes (`bot` / `usuario`).
     - Botones de acción:
       - “Ver productos con stock \< 7”
       - “Ver productos con stock = 0”
       - “Ver top 3 más vendidos de la semana”
   - Al hacer clic en una opción:
     - Agrega un mensaje del usuario con el texto de la acción.
     - Llama al endpoint correspondiente del backend.
     - Formatea la respuesta en mensajes del bot (lista acotada de productos y un resumen, por ejemplo “… y X más”).
   - Usa `localStorage` (`catalogoAsistido.ultimoChequeo`) para registrar la última ejecución de una consulta del asistente, permitiendo implementar reglas futuras de “cada 7 días” desde el cliente.

3. **Integración en `DashboardPage`:**
   - Se importa y renderiza el widget debajo de la primera fila de métricas, dentro de la vista de resumen general (`/dashboard`).
   - El usuario ve el asistente inmediatamente después de loguearse y acceder al dashboard.

4. **Estilos (`CatalogoAsistidoWidget.module.css`):**
   - Card compacta con encabezado propio (“Asistente de catálogo”) y descripción corta.
   - Contenedor de mensajes con scroll vertical suave, burbujas diferenciadas para bot/usuario y botones tipo “pill” para las opciones.

## Explicación Didáctica
- **¿Qué problema resuelve?**
  - En lugar de que el usuario navegue por múltiples pantallas para saber cómo está su stock, el “chat” le ofrece tres preguntas frecuentes ya preparadas. Es como tener un mini-analista de negocio dentro del dashboard.
- **¿Cómo se siente para el usuario?**
  - El flujo es conversacional y guiado: el sistema lo saluda por su nombre y le propone acciones en lenguaje natural. Al hacer clic, las respuestas aparecen en formato de lista dentro del mismo widget, sin recargar la página ni abrir modales adicionales.

