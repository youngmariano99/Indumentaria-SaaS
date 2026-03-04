# PWA: Ciudadana de Clase Mundial (Estándares 2026)

Objetivo: Convertir la aplicación en una PWA de alto rendimiento siguiendo los estándares más exigentes de la industria.

## 1. Manifiesto y Ciclo de Instalación "Basado en la Intención"
*   **Implementación Técnica:** Configuración de un `manifest.json` dinámico que soporta el esquema de subdominios por inquilino.
*   **Instalación Silenciosa:** Evitar el banner de instalación automático. Programar la lógica para disparar el `beforeinstallprompt` solo tras una "interacción de valor" (ej. primera venta o carga de stock exitosa).
*   **Atajos (Shortcuts API):** Definición de accesos directos específicos para "Punto de Venta" y "Gestión de Stock".
*   **Identidad:** Colores `theme_color` y `background_color` adaptativos y uso de `display: standalone`.

## 2. Arquitectura Local-First y Sincronización de Stock
*   **Base de Datos Local:** Implementación de SQLite o IndexedDB como base de datos primaria en el frontend.
*   **Resolución de Conflictos (CRDT):** Uso de librerías como **Loro** o **Yjs** para manejar inventarios conmutativos, asegurando que los decrementos se sumen matemáticamente.
*   **Persistencia Invisible:** Integración con **PowerSync** para replicar el WAL de PostgreSQL, respetando RLS basado en JWT.
*   **Reglas de Datos:** Generación de UUIDs en cliente y uso de *Soft Deletes* (`is_deleted`).

## 3. Ergonomía y Layout Adaptativo 2026
*   **Thumb Zone Design:** Botones críticos ("Cobrar", "Siguiente") ubicados en el arco natural del pulgar.
*   **Responsive Progresivo:**
    *   **Móvil:** Bottom Tab Bar (POS, Buscar, Stock, Perfil).
    *   **Tablet:** Drawer Lateral colapsable.
    *   **PC:** Sidebar persistente con atajos de teclado.
*   **Gestión de Viewport:** Uso de la API `VisualViewport` para ajustar el diseño cuando aparece el teclado virtual.

## 4. Integración de Hardware y Web APIs Modernas
*   **Impresión Térmica:** Web Bluetooth API para comandos ESC/POS directos.
*   **Escaneo de Barcodes:** API `BarcodeDetector` para escaneo de alta velocidad vía cámara.
*   **Acceso a Archivos:** File System Access API para guardado directo de reportes PDF/Excel.
*   **Social Commerce:** Web Share Target para recibir imágenes y crear borradores de productos automáticamente.

## 5. Estrategia de Rendimiento y Caché (Workbox)
*   **App Shell Pre-rendering:** Carga interactiva en <1s.
*   **Políticas de Caché:**
    *   **Core (JS/CSS):** Precache & Versioned.
    *   **Fotos:** Cache First (30 días).
    *   **Precios:** Stale While Revalidate.
*   **Prefetching Predictivo:** Carga del módulo "Cierre de Caja" cuando el usuario está en la pantalla de ventas.

## 6. Accesibilidad y Estética Funcional
*   **Interfaces de Voz:** Web Speech API para búsquedas y dictado.
*   **Salud Laboral:** Dark Mode nativo y `prefers-reduced-motion`.
*   **Interactividad:** Áreas de toque mínimas de 44px y optimización del Interaction to Next Paint (INP).

---

### Implementación Técnica

#### `public/manifest.json` (Ejemplo Dinámico)
```json
{
  "name": "Sistema POS Pro",
  "short_name": "POS",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "shortcuts": [
    {
      "name": "Punto de Venta",
      "url": "/pos",
      "icons": [{ "src": "/icons/pos.png", "sizes": "192x192" }]
    },
    {
      "name": "Stock",
      "url": "/inventory",
      "icons": [{ "src": "/icons/stock.png", "sizes": "192x192" }]
    }
  ]
}
```

#### `sw.js` (Workbox Strategy)
```javascript
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

// Cache de Imágenes de Productos
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'product-images' })
);

// Precios y Datos Volátiles
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/prices'),
  new StaleWhileRevalidate({ cacheName: 'api-prices' })
);
```

#### `useLocalFirst.ts` (React Hook)
```typescript
import { useEffect, useState } from 'react';
import { initLocalDB, syncChanges } from './db-engine';

export const useLocalFirst = (tenantId: string) => {
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initLocalDB(tenantId);
      // Lógica de sincronización en segundo plano
      syncChanges().then(() => setIsSynced(true));
    };
    setup();
  }, [tenantId]);

  return { isSynced };
};
```