Aquí tienes el Prompt de Diseño exacto para que se lo entregues a una IA generadora de interfaces (como Antigravity, v0.dev o Claude).

Este prompt está estructurado para obligar a la IA a diseñar un modal que sea "a prueba de tontos" (sin opciones de márgenes) y que respete la estética moderna y limpia de tu plataforma.

Copia y pega esto en tu generador de UI:
Rol: UI/UX Senior Designer experto en interfaces B2B Enterprise y Sistemas de Punto de Venta (POS).

Tarea: Diseñar un "Modal de Impresión Inteligente de Etiquetas" (Smart Print Dialog) para un SaaS de indumentaria. Este modal reemplaza por completo el cuadro de diálogo nativo del navegador para evitar errores humanos (como cambios de escala o márgenes).

Estilo Visual (Fashion-Tech):

Colores: Fondo del overlay en negro con opacidad 50% (Glassmorphism). El modal debe ser blanco puro (#ffffff). Botón principal en Azul Profesional (#2563eb). Textos en grises oscuros (#1f2937 y #4b5563).

Tipografía: Limpia y geométrica (estilo Inter o Roboto).

Bordes: Suavizados (border-radius: 12px) y sombras sutiles (box-shadow: lg).

Estructura del Modal (Layout dividido en 2 columnas):

Columna Izquierda (Área de Previsualización - WYSIWYG):

Debe ocupar el 55% del modal. Fondo gris muy claro (#f3f4f6).

En el centro, mostrar una "tarjeta" blanca que represente fielmente una etiqueta térmica física (proporción 50x30mm, es decir, un rectángulo apaisado).

Contenido de la etiqueta de muestra: Debe verse un logo genérico arriba, el nombre "Remera Básica Oversize", "Talle: M", un precio grande "$25.000", un Código de Barras (1D) en la base y un Código QR pequeño a la derecha.

Columna Derecha (Panel de Control Ergonómico):

Ocupa el 45% restante. Diseño vertical con mucho espacio en blanco.

Sección 1: Formato de Salida. Un selector tipo "Tabs" o "Toggle" grande con dos opciones: "Térmica (Directa)" y "Hoja A4 (Grilla)".

Sección 2: Cantidad. Un input numérico para "Copias por Variante". Debe tener botones grandes de [ - ] y [ + ] a los lados para uso táctil fácil (altura mínima 48px).

Sección 3: Acciones (Fijadas abajo).

Botón Principal (Primary): Texto "Imprimir Etiquetas". Fondo azul (#2563eb), texto blanco, con un icono de impresora o Bluetooth. Alto y ancho completo (100% width, 48px height).

Botón Secundario (Secondary): Texto "Descargar PDF". Estilo "Outline" (fondo transparente, borde gris).

Restricciones de UX:

NO incluir absolutamente ninguna opción de configuración avanzada (ni márgenes, ni escalas, ni tamaño de papel). La interfaz debe transmitir que el sistema ya calculó todo automáticamente.

Incluir un botón sutil de "X" (Cerrar) en la esquina superior derecha.