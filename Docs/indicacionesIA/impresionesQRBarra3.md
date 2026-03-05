Rol: Actúa como un Desarrollador Frontend Senior experto en React, TypeScript y generación de documentos para impresión industrial (jsPDF + html2canvas).

Contexto del Proyecto: > Estoy desarrollando el módulo de impresión de etiquetas (códigos de barras y QR) para un SaaS de indumentaria. Actualmente, el componente funciona, pero presenta tres fallos críticos en la renderización y uso del papel que necesito corregir a nivel de código y estilos (CSS Modules).

. Necesito que lo refactorices cumpliendo estrictamente con los siguientes 3 objetivos:

1. Corrección de Recortes en Impresión Directa (Thermal/Local):

Problema: Las etiquetas salen cortadas en los bordes.

Solución requerida: Asegúrate de que el contenedor de impresión utilice exclusivamente unidades físicas (mm) en lugar de px. Revisa que las reglas @media print aíslen correctamente el contenedor (ocultando barras de navegación o scrollbars que fuercen un desbordamiento) y establece una "Safe Zone" (margen interno) de 2mm a 3mm. El contenedor que se va a capturar debe tener max-height: none temporalmente para que no se oculte nada.

2. Paginación Dinámica en PDF (Evitar cortes al final de la hoja):

Problema: Al generar el PDF (A4/A3) usando jsPDF y html2canvas, la última etiqueta de la página se corta por la mitad si no entra completa al final del documento.

Solución requerida: Implementa un algoritmo matemático de "Rastreo de Eje Y" (Y-Position Tracking). Antes de añadir una etiqueta al PDF, el código debe calcular si PosiciónActualY + AltoDeLaEtiqueta + Margen > AltoTotalDeLaPagina. Si esta condición se cumple, el sistema debe disparar el comando doc.addPage() y reiniciar la coordenada Y a cero antes de insertar esa etiqueta, asegurando que pase intacta a la siguiente hoja.

3. Optimización de Espacio (Sistema Multicolumna/Grilla):

Problema: Las etiquetas se están imprimiendo en una sola fila (columna única) vertical, desperdiciando una enorme cantidad de espacio horizontal en hojas A4 y A3.

Solución requerida: Refactoriza el CSS y la lógica de renderizado para aplicar un sistema de CSS Grid dinámico. Las etiquetas deben distribuirse en múltiples columnas (ej. 3 o 4 columnas en A4, dependiendo del ancho de la etiqueta configurada). El motor debe calcular el layout de la grilla antes de que html2canvas tome la captura, garantizando que se imprima la máxima cantidad de etiquetas posibles por hoja de izquierda a derecha y de arriba hacia abajo.

Instrucciones de Entrega:

Analiza el código que tenemos.

Identifica dónde están fallando los cálculos de dimensiones y el layout actual.
