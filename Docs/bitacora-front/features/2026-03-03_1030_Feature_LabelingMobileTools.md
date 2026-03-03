# Feature: Operación Móvil y Etiquetado (Frontend)

Implementación de herramientas para mejorar la velocidad operativa: escaneo de productos, impresión de etiquetas térmicas y carga masiva.

## Cambios Realizados

- **`useBarcodeScanner`**: Hook de React que detecta entradas rápidas de teclado (simulando un escáner láser) y gatilla eventos de búsqueda/agregado al carrito.
- **`ModalImpresionEtiquetas`**: Componente que genera una vista previa de etiquetas con códigos QR/Barras, optimizado para impresoras térmicas mediante `@media print`.
- **POS Mobile Optimization**: Implementación de botones fijos en la "Thumb Zone" (zona del pulgar) para agilizar el cobro en dispositivos táctiles.
- **`ImportarCatalogoPage`**: Interfaz para cargar cientos de productos mediante copiado/pegado de texto tabulado o CSV.
- **Integración con Catálogo**: El modal de producto ahora incluye un botón de "Imprimir etiquetas" que abre la herramienta de impresión.

## Detalles Técnicos

- **Escaneo**: Se usa un umbral de 50ms entre pulsaciones para distinguir el escáner del tecleo manual.
- **Impresión**: Se ocultan elementos UI durante la impresión (`display: none`) y se fuerza el tamaño de papel a `80mm x 30mm` (o similar configurable).
- **UX**: Navegación mejorada con atajos de teclado (F2, F10) para el flujo de venta.

## Didáctica para el Usuario

Imagina que estás en un local con mucha gente. Antes tenías que buscar cada prenda por nombre. Ahora:
1. Pasás el escáner y el producto entra solo al ticket.
2. Si es una prenda nueva, podés imprimir una tanda de etiquetas térmicas desde el catálogo en segundos.
3. El botón de cobro está justo donde llega tu dedo pulgar cuando sostenés el celu con una mano.
