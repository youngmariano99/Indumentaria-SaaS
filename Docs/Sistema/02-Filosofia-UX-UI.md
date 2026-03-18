# Filosofía UX/UI y Experiencia Frontend

Indumentaria-SaaS no es solo una web de gestión; es una Progressive Web App (PWA) diseñada con una mentalidad de **"Cero Entrenamiento" (Zero-Training)** y **Agnosticismo de Rubro**.

---

## 🎓 1. UX Educativa (Zero-Training)
Nuestra meta es que un usuario nuevo pueda operar el sistema sin leer un manual. Esto se logra mediante:

- **Lenguaje Vernáculo**: No usamos términos técnicos si hay una alternativa de negocio. (Ej: En lugar de "Boolean Features", usamos "Permitir ver costos").
- **Estados Vacíos Accionables**: Cuando una pantalla no tiene datos, no mostramos un espacio en blanco; mostramos una ilustración y un botón claro de "Comenzar aquí".
- **Divulgación Progresiva**: Los formularios complejos se dividen en pestañas o cajones laterales (`Drawers`) para no abrumar al usuario con 20 campos de una vez.
- **Reversibilidad**: Casi todas las acciones críticas (borrar, guardar) disparan un Toast que permite deshacer (**Undo**) la acción.

---

## 📱 2. Mobile-First y PWA Novedosa
Aunque es un SaaS empresarial, el 80% de la carga operativa ocurre en dispositivos móviles o tablets en el punto de venta.

- **Offline-First**: Gracias a los Service Workers, el sistema carga instantáneamente y permite navegar por el catálogo incluso si la conexión a internet es inestable o nula.
- **Hardware Sync**:
    - **Escaneo de Barras**: Utilizamos la cámara del celular con la API nativa de la GPU (`BarcodeDetector`) para lograr escaneos rápidos.
    - **Impresión Térmica**: Conexión vía Web Serial/Bluetooth. Aplicamos **Aislamiento de Impresión** mediante `@media print` y la técnica de `visibility: hidden` en el `body`, permitiendo imprimir solo el área del ticket/etiqueta sin elementos de la UI (menús, botones).
    - **Formatos Flexibles**: Soporte para Térmico (rollo), Grilla A4 (hojas autoadhesivas) y PDF (jsPDF/html2canvas).
- **Ergonomía**: Los botones importantes están al alcance del pulgar (zona inferior) y los elementos táctiles tienen un tamaño mínimo de 44x44px.

---

## 🧪 3. UI Mutante (Metadata-Driven)
La interfaz es "mutante" porque se autoconfigura según lo que el servidor diga que el negocio necesita:

### Manifiesto de Rubro
A través del header `X-Rubro-Manifest`, el frontend recibe un diccionario. Nunca escribimos "Talle" de forma estática; usamos la función `t('Variante_Label', 'Variante')`.
- Si el rubro es **Indumentaria**, el usuario verá "Talle".
- Si el rubro es **Ferretería**, el usuario verá "Medida".

### Generación Dinámica (FieldFactory)
Los formularios de alta de productos no tienen campos fijos. Se recorre un esquema JSON enviado por el backend que define:
- Qué tipo de campo es (Texto, Número, Selección).
- Qué metadatos requiere (ej: "Temporada" solo aparece si el esquema lo pide).

---

## 🔋 4. Gestión de Estado (Zustand)
Utilizamos **Zustand** para un estado global ligero y persistente:
- **authStore**: Token y datos del usuario.
- **sucursalStore**: Sede activa con persistencia local.
- **rubroStore**: El manifiesto y diccionario actual (se actualiza automáticamente por el interceptor de Axios).
- **featureStore**: El mapa de interruptores de funcionalidad (Features) activos.

---

## 🛠️ Stack Tecnológico Frontend
- **Framework**: React 18+ con Vite.
- **Lenguaje**: TypeScript.
- **Estilos**: CSS Modules (Vanilla CSS con scoping).
- **Iconos**: Phosphor Icons (Línea gruesa para mejor visibilidad en móviles).
- **Queries**: React Query (TanStack Query) para sincronización con el servidor.
