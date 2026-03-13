# Fix: Aislamiento de Rubros - Codificación de Headers y CORS

**Fecha:** 2026-03-13  
**Módulo:** Infraestructura (Backend/Frontend)  
**Error:** `Invalid non-ASCII or control character in header` y Headers de Rubro bloqueados.

---

## 1. Problema (Issue)
Durante la implementación del aislamiento de rubros (Ferretería vs Indumentaria), se detectaron tres problemas críticos:
1. **Fallo de Servidor (ASCII Error):** Al intentar enviar el diccionario de términos técnicos (ej: "Línea/Colección", "Inventario Técnico") en los encabezados HTTP (`X-Rubro-Manifest`), el servidor fallaba porque los protocolos HTTP estándar no admiten caracteres con acentos (Unicode) directamente en los headers.
2. **Bloqueo de CORS:** Los encabezados personalizados del rubro llegaban al navegador pero eran bloqueados por la política de seguridad, impidiendo que el Frontend (React) leyera la configuración dinámica.
3. **Contaminación Visual:** Elementos específicos de indumentaria (como el campo "Temporada") aparecían en el rubro de ferretería.

## 2. Solución Aplicada

### Backend (`API/Program.cs` y Middleware)
*   **Codificación Base64:** Se modificó `DiccionarioRubroMiddleware.cs` para codificar el JSON del diccionario en Base64 antes de enviarlo. Esto asegura compatibilidad total con el protocolo HTTP independientemente de los caracteres usados.
*   **Exposición de Headers:** Se actualizó la política de CORS en `Program.cs` para exponer los encabezados:
    ```csharp
    .WithExposedHeaders("X-Rubro-Id", "X-Rubro-Slug", "X-Rubro-Manifest")
    ```

### Frontend (`lib/apiClient.ts` y Catálogo)
*   **Decodificación Robusta:** Se implementó un decodificador en el interceptor de peticiones usando `TextDecoder` para reconstruir correctamente el UTF-8 desde el Base64 recibido.
*   **Visibilidad Condicional:** En `CatalogoPage.tsx`, se implementó lógica para ocultar la columna y el filtro de "Temporada" basándose en la propiedad `isIndumentaria` del hook `useRubro`.
*   **Internacionalización Total:** Se migraron todas las etiquetas estáticas ("Talle", "Color", "Temporada") a llamadas dinámicas `t('key', 'fallback')`.

## 3. Impacto
*   **Aislamiento:** Un usuario de Ferretería ahora ve una interfaz técnica ("Medida", "Material", "Inventario") sin ruido de otros rubros.
*   **Robustez:** El sistema no fallará si un administrador agrega términos con acentos o eñes en el diccionario del rubro.
*   **Escalabilidad:** Añadir un nuevo rubro ahora solo requiere actualizar su diccionario en la DB; la UI se adaptará automáticamente.

---
**Estado:** Resuelto ✅  
**Próximos Pasos:** Extender esta auditoría al módulo de Reportes y Dashboards.
