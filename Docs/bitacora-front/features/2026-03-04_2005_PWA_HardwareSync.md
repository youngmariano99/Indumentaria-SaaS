# Ticker: PWA - Integración Híbrida de Hardware (Local-First Architecture)

**Fecha y Hora:** 2026-03-04 20:05
**Tipo de Cambio:** Feature de Infraestructura Front-end / Hardware Integrations
**Tags:** #Modulo_PWA, #Hardware_APIs, #File_System, #Barcode_Camera, #Social_Commerce

## Impacto Transaccional
Este parche reduce a cero la fricción entre el navegador web y las capacidades nativas del dispositivo de turno del empleado (PC Windows o Teléfono Android), borrando la línea divisoria entre "Página Web" y "App Instalada".

## Detalle Técnico
1. **File System Access API (`ModalImpresionEtiquetas.tsx`)**: Reemplazamos la orden de descarga ciega a la carpeta de caché por el método `window.showSaveFilePicker()`. Esto dispara el cuadro de diálogo estándar del sistema operativo ("Guardar Como..."), dándole control al operario para enrutar el PDF de las etiquetas directo a su disco D: o PenDrive. Tiene un catch elegante de retroceso si el navegador activo no lo soporta.
2. **Barcode Detector (Hardware GPU) (`CameraScanner.tsx`)**: Se inyectó un modal que habilita la cámara con facingMode "environment". Este modal no se queda buscando pixeles en bruto como lo harían librerías Javascript desactualizadas, sino que invoca a la nueva API global genérica `new BarcodeDetector()` que, en Android y Windows modernos, utiliza los chips dedicados a procesamiento de imagen (NPU/GPU) para descifrar EAN-13, QR o Barcodes a velocidades supersónicas (> 5 fps de chequeo) a consumo mínimo de batería. Agregamos el anclaje a la ventana del Punto de Venta.
3. **Web Share Target (Social Commerce Native Router)**: Extendimos agresivamente el archivo `vite.config.ts` inyectando el contrato `share_target`. Gracias a ello, el SaaS no solo "se abre" sino que ahora el sistema operativo "nos ofrece". Cualquier imagen, link o texto que esté en la galería y el empleado le dé a "Compartir", podrá ser arrojado vía GET Param al router `/shared-product`, inyectando la información pre-cargada para la creación directa del borrador en el inventario.

## Explicación Didáctica
1. **Guardar PDFs como adulto:** Ya no más carpetas de descargas repletas de "etiquetas (1)(1)(1).pdf". Tocás imprimir, se abre la clásica ventanita de Windows pidiéndote confirmar el nombre, y lo mandás a donde quieras.
2. **Cámara Supersónica:** Si no tenés la pistola láser física y andás con el celular armando pedidos, hay un nuevo iconito flotante verde de cámara en la pantalla de cobro. Tocás ahí, se prende tu cámara, y el propio Android se encarga de leer el chasis del código EAN (velocidad de fracción de segundos, gasta menos de la mitad de batería que lo usual ya que pasa por las venas del S.O.).
3. **Integración Nivel WhatsApp:** Estás navegando un proveedor en tu navegador del celu, o estás en tu galería de fotos viendo la mercancía que te mandaron recién. Le pones "Compartir" de toda la vida... y ahora en la listita entre Instagram y tus contactos, aparece "SaaS POS". Tocás ese ícono, se te abre tu sistema, y ya tenés el producto completado a nivel boceto para darle alta en tu stock de la sucursal. Magia negra de las PWA en 2026.
