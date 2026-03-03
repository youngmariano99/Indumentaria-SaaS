# Fix: Salida de PDF en Blanco y Recorte de Contenido

- **Fecha y Hora:** 2026-03-03 17:40
- **Tipo de Cambio:** BugFix
- **Módulo:** #Modulo_Catalog
- **Área:** #Area_Frontend
- **Nivel de Seguridad:** #Nivel_Seguridad_Bajo

## Descripción del Problema
Al intentar imprimir etiquetas, la salida del PDF aparecía en blanco o con el contenido recortado a la mitad de la primera página. Esto se debía a:
1.  Restricciones de visibilidad en el CSS de impresión (`@media print`) que ocultaban elementos necesarios para la captura.
2.  Límites de altura (`max-height` y `overflow-y: auto`) en el contenedor de previsualización que impedían que `html2canvas` capturara el contenido "fuera de la pantalla".

## Detalle Técnico
- **Solución CSS**: Se eliminaron los `display: none` agresivos en el archivo `ModalImpresionEtiquetas.module.css` y se ajustaron las reglas de `page-break-inside`.
- **Solución JS**: Se implementó una expansión temporal del contenedor (`viewRef.current.style.maxHeight = 'none'`) justo antes de la captura de pantalla y su restauración inmediata posterior.
- **Paginación**: Se añadió lógica para detectar cuando la imagen capturada supera la altura de una página física y se fragmenta en múltiples hojas usando `jsPDF.addPage()`.

## Explicación Didáctica
Imagina que querés sacarle una foto a un edificio muy alto, pero tu cámara solo saca fotos cuadradas.
1.  **El problema**: Antes, la cámara le sacaba foto solo a la base del edificio (lo que se veía en pantalla) y el resto quedaba afuera.
2.  **La solución**: Ahora, el sistema estira el edificio momentáneamente para que entre todo, le saca varias fotos por partes, y después pega esas fotos en un álbum de varias páginas (el PDF), asegurándose de que el edificio vuelva a su tamaño normal inmediatamente después de la foto.

Archivos clave:
- `ModalImpresionEtiquetas.tsx`: Lógica de expansión de altura y paginación PDF.
- `ModalImpresionEtiquetas.module.css`: Ajustes de CSS Print para no ocultar etiquetas.
