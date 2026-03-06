# Fixes y Refactorización: Motor de Impresión Etiquetas (2026-03-05)

## 🎯 Objetivo General
Transformar el modal básico de impresión en un **Motor Universal POS B2B**, solucionando fallos críticos de recorte en el formato físico (Rollo Térmico y Grilla A4/A3) y en la exportación a PDF, blindando la experiencia de configuraciones erróneas del navegador por parte del operario.

---

## 🐛 1. Resolución de Problemas (Fixes)

### A. Problema de la "Captura de Pantalla" (Márgenes e Interfaz Gris)
- **Reporte:** Al imprimir de forma nativa (`Ctrl+P` o botón Imprimir), el navegador intentaba meter en el papel todo el sistema (menús laterales, fondos oscuro del modal, botones), arruinando las etiquetas.
- **Solución (Aislamiento CSS):** Implementamos un esquema fuerte de visibilidad en `ModalImpresionEtiquetas.module.css`. 
  - Regla base: `visibility: hidden !important;` a *todo* el `<body>`.
  - Excepción explícita: `visibility: visible !important;` únicamente al `#print-area` y a las etiquetas. 
  - De este modo, la impresora "se queda a ciegas" ante todo lo que no sea la etiqueta prístina blanca.

### B. Recorte Físico en Tickets Térmicos (Bordes Perdidos)
- **Reporte:** El texto y los códigos de barras de las etiquetas térmicas (50x30mm) salían mordidos en los costados debido a la tracción imprecisa mecánica de las ticketeras.
- **Solución (Safe Zones):** El ancho de la base (`.etiquetaIndividual`) pasó a ser dinámico (`100%`) y se aplicó una inyección estricta de `box-sizing: border-box` más un `padding: 3mm`. Estos 3mm fungen como la "Zona de Seguridad" que absorbe cualquier desvío de milímetros del papel interno sin afectar el código QR.

### C. PDF Cortado en la Última Etiqueta de la Hoja
- **Reporte:** El generador de PDFs (`jsPDF` + `html2canvas`) sacaba una "súper foto" kilométrica a todo el bloque y la fraccionaba cada 297mm (A4). ¿Resultado? Si justo a los 297mm estaba en medio de una etiqueta, la partía en dos.
- **Solución (Y-Position Tracking Matemático):** 
  - Intervenimos el lazo iterativo de `handleDownloadPDF`.
  - En lugar de capturar el bloque madre, iteramos un render niño por niño (`for Node of Labels`).
  - Lógica implementada: Si pos_actual_Y + altura_de_la_etiqueta > altura_de_hoja, entonces *Cortar* (`pdf.addPage()`), *Resetear Y al margen superior* y volver a dibujar la grilla. El PDF ahora salta de hoja de manera limpia.

---

## 🚀 2. Mejoras de Arquitectura y Negocio (Features)

### A. Compatibilidad Multi-Hardware Térmico Automática
- **Contexto:** Se detectó la necesidad de soportar máquinas chinas, Zebra y Brother con anchos distintos a los 50mm genéricos, incluyendo 58mm, 80mm e industriales de hasta 216mm.
- **Implementación:**
  - Se agregó el estado `anchoTermico`.
  - Al abrir impresión térmica y seleccionar (ej. 80mm), React **inyecta un tag `<style>` global** instantáneo con la regla CSS `@page { size: 80mm auto; margin: 0; }`. 
  - Efecto: El Driver de Windows / `window.print` adapta mágicamente el lienzo a la ticketera conectada en ese preciso momento, garantizando el modo contínuo Kiosk.
  - La escala del Código de Barras y el QR responden a fórmulas matemáticas en el JSX (*Si es térmico < 50, Scale QR 25; sino 35*).

### B. Rediseño UI: Interfaz Táctil B2B (Layout WYSIWYG a 2 Columnas)
- **Inspiración:** Se transmutó el viejo modal de "Cuadro de Mensaje" a una Central POS con dos paneles (55% / 45%).
- **PreviewPane (Izq):** Emulación de tarjeta con scroll infinito, fondo gris claro con etiqueta blanca prístina (What You See Is What You Get interactivo instantáneo).
- **ControlPane (Der):** Formularios amplios limpios (Bordes suavizados 12px), sin inputs estándar. Posicionamos Selector estilo Tabs.
- **Motor de Copias:** Se implementó `const etiquetasAImprimir = etiquetas.flatMap(etiq => Array(copias).fill(etiq))` junto a botones `[+]` y `[-]` táctiles industriales de `48px` de altura.
- **Hotfix de Escala Píxel-Perfect:** Se agregó `hotfixes: ['px_scaling']` en el motor de `jsPDF` logrando vectores sumamente definidos aun exportando bitmaps, una ganancia brutal de nitidez frente al código legacy.

---

## 📁 Archivos Clave Modificados
- `frontend/src/features/catalog/components/ModalImpresionEtiquetas.tsx`
- `frontend/src/features/catalog/components/ModalImpresionEtiquetas.module.css`
