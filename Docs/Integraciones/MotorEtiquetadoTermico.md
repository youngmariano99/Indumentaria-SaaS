# Motor de Etiquetado Térmico (Indumentaria-SaaS)

Este documento detalla la arquitectura, lógica y componentes utilizados para la generación e impresión de etiquetas de productos, optimizado para impresoras térmicas (50mm x 30mm) y formatos de hoja estándar (A4/A3).

## 1. Tecnologías y Librerías
- **React (Frontend):** Interfaz de usuario y matriz de datos.
- **jsbarcode:** Generación dinámica de códigos de barras (formato CODE128).
- **qrcode.react:** Generación de códigos QR para escaneo móvil.
- **html2canvas:** Captura de áreas del DOM para conversión a imagen (usado en la descarga de PDF).
- **jspdf:** Generación del documento PDF final para descarga de archivos.
- **CSS Modules (@media print):** Motor principal de renderizado nativo para impresoras térmicas.

## 2. Lógica de Impresión Nativa
A diferencia de generar una "captura de pantalla", el sistema utiliza directivas CSS nativas para el navegador:

### Aislamiento de Impresión
Para evitar que la interfaz de la aplicación (menús, botones, fondos) interfiera con las etiquetas, se aplica la siguiente técnica en `ModalImpresionEtiquetas.module.css`:
- Se utiliza `visibility: hidden` en todos los elementos del `body`.
- Se fuerza `visibility: visible` exclusivamente en el `overlay` del modal y sus hijos.
- Se resetea el posicionamiento del modal a `static` o `absolute` en el tope, eliminando sombras y bordes decorativos.

### Orquestación de Formatos
El usuario puede elegir entre tres modos:
1. **Térmico (Individual):** Layout vertical fluido (`flex-direction: column`). Utiliza `@page { size: auto; }` para que la impresora térmica (driver) tome el control del corte de papel.
2. **Grilla A4:** Distribución en 3 columnas optimizada para hojas autoadhesivas.
3. **Grilla A3:** Distribución amplia para producción a gran escala.

## 3. Generación de PDF (Lógica de Motor)
Cuando el usuario elige "Descargar PDF", se dispara el siguiente flujo:
1. **Clonado de Área:** Se selecciona el div `#print-area`.
2. **Rasterización:** `html2canvas` convierte el HTML (incluyendo SVG de códigos de barras) en un Canvas de alta resolución (`scale: 2`).
3. **Ajuste de PDF:** `jspdf` crea un documento con las dimensiones exactas del área capturada y añade la imagen, garantizando que el archivo sea una réplica exacta de lo que se ve en pantalla.

## 4. Hardware Soportado
- **Impresoras Térmicas:** Cualquier impresora compatible con drivers de Windows/POS (Zebra, Brother, Xprinter, etc.).
- **Escáneres:** Diseñado para funcionar con pistolas HID (emulación de teclado) gracias a la estructura clara de SKUs en las etiquetas.

---
> [!TIP]
> Si la vista previa de impresión sale en blanco, asegúrese de que el modal no esté siendo ocultado por una regla `display: none` en algún componente padre. El sistema actual utiliza `visibility` para evitar este conflicto.
