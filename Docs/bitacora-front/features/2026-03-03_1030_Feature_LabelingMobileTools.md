# Feature: Operación Móvil y Etiquetado (Frontend)

- **Fecha y Hora:** 2026-03-03 10:30 (Actualizado 17:35)
- **Tipo de Cambio:** Nueva Función / Refinement
- **Módulo:** #Modulo_Catalog #Modulo_POS
- **Área:** #Area_Frontend

Implementación de herramientas para mejorar la velocidad operativa: escaneo de productos, impresión de etiquetas térmicas y carga masiva.

## Cambios Realizados

- **`useBarcodeScanner`**: Hook de React que detecta entradas rápidas de teclado (simulando un escáner láser) y gatilla eventos de búsqueda/agregado al carrito.
- **`ModalImpresionEtiquetas` Pro**:
    - **Etiquetado Dual**: Soporte para renderizar código de barras (1D) y QR simultáneamente por cada variante.
    - **Descarga Directa PDF**: Integración de `jsPDF` y `html2canvas` para descargar archivos PDF sin depender del diálogo de impresión del sistema.
    - **Multipágina**: Lógica automática para crear nuevas hojas en el PDF si las etiquetas exceden el tamaño de la hoja (A4, A3 o Térmico).
- **Rediseño de Navegación**: El acceso a "Carga Masiva" se movió del sidebar al header de la página de Catálogo para mejorar la coherencia visual.
- **POS Optimization**: Remoción de escáner por cámara redundante (se prioriza uso nativo/pistola HID) y optimización de "Thumb Zone".
- **`ImportarCatalogoPage`**: Interfaz técnica para procesamiento por lotes vía `CrearProductosBatchCommand`.

## Detalles Técnicos

- **Paginación PDF**: El sistema calcula la altura del contenido capturado vs el tamaño de página elegido (`format: [50, 30]`, `a4` o `a3`) y añade páginas usando `pdf.addPage()`.
- **Captura sin recortes**: Se expande temporalmente el `max-height` del contenedor de previsualización durante la captura para que `html2canvas` tome todas las etiquetas.
- **Dual Codes**: Uso de `react-barcode` para cumplimiento de estándares industriales 1D y `qrcode.react` para consulta móvil rápida.

## Explicación Didáctica

Imagina que estás en un local con mucha gente y tenés que etiquetar 100 prendas nuevas.
1. **El Motor de Etiquetas**: Es como una imprenta inteligente. Antes tenías que diseñar cada etiqueta; ahora apretás un botón y te genera un PDF con 100 etiquetas perfectas, con código de barras para la caja y QR para que el cliente vea info en su celu.
2. **El Generador PDF**: Funciona como una cámara súper rápida que saca una foto de todas las etiquetas juntas ("Capture") y las pega prolijamente en hojas (A4 o A3) "sin que se corten los bordes", asegurando que cada hoja esté llena antes de pasar a la siguiente.
3. **El Escaneo**: El sistema ahora "escucha" tan rápido que sabe la diferencia entre un humano escribiendo despacio y un láser disparando el código en milisegundos.

Archivos clave:
- `ModalImpresionEtiquetas.tsx`: El cerebro de la imprenta.
- `useBarcodeScanner.ts`: El oído atento a los escáneres láser.
- `CatalogoPage.tsx`: El punto de partida de toda la mercadería.
