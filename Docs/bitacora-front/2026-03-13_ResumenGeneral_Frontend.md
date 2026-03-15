# Resumen General del Sistema (Frontend)
**Rango de Fechas:** 24 de Febrero de 2026 — 13 de Marzo de 2026
**Propósito:** Proporcionar un panorama instantáneo del estado actual de la interfaz de usuario (React/Vite) a desarrolladores y futuras inteligencias artificiales, delineando qué capacidades visuales e interactivas están ya operativas.

---

## 🎨 1. Base UI y Design System
- **Arquitectura de Slices:** Componentes desacoplados en `frontend/src/features/` para escalabilidad.
- **CSS Modules:** Estilización modular y aislada, utilizando una paleta de colores y tokens centralizados en `variables.css`.
- **Aislamiento de Rubro (Sprint 10):** Implementación del hook `useRubro` y función `t()` para traducción dinámica de etiquetas (ej: de "Talles" a "Medidas") y **Visibilidad Condicional** (ej: ocultar "Temporada" en ferretería).
- **Sincronización por Headers:** Interceptor de `apiClient` que decodifica metadatos en Base64 para actualizar el estado global del rubro sin peticiones adicionales.
- **UI Mutante (Sprint 4 & 8):** Motor de renderizado dinámico `FieldFactory` que genera formularios basados en esquemas JSON recibidos del backend para cada industria.
- **UX Progresiva (Sprint 5):** Implementación de `Smart Defaults` y `Drawers` laterales para una carga de datos fluida.
- **Framework UX/UI Educativa (Marzo 2026):** Estructura de diseño "Zero-Training" con:
    - **Agnostic Components:** Botones ergonómicos, estados vacíos accionables y divulgación progresiva (`Disclosure`).
    - **Reversibilidad:** Sistema de `Toast` global con soporte para **Undo** en acciones críticas.
    - **Vernacular Design:** Terminología dinámica que muta según el rubro (Ferretería vs Indumentaria).

## 📱 2. PWA y Capacidades Nativas (Sprint 5)
La aplicación ha trascendido el navegador para comportarse como una App Nativa:
- **Offline-First:** Uso de Service Workers y App Shell para garantizar navegación sin internet.
- **Hardware Sync:** 
    - **Cámara GPU:** Escaneo de códigos ultra-rápido mediante la API `BarcodeDetector` (NPU/GPU nativo) en dispositivos móviles.
    - **Share Target:** Integración con el menú "Compartir" del sistema operativo para crear borradores de productos directamente desde la galería o navegador externo.
    - **File System Access:** Diálogos nativos de "Guardar como..." para enrutar PDFs de etiquetas.

## 🖨️ 3. Sistema de Impresión Universal (3-Tier)
Lógica de impresión robusta y adaptable a cualquier hardware:
- **Nivel 1 (Web Serial):** Conexión directa USB a impresoras térmicas chinas genéricas (Comandos ESC/POS y TSPL).
- **Nivel 2 (Web Bluetooth):** Soporte para impresoras térmicas portátiles desde celulares.
- **Nivel 3 (PDF Fallback):** Generación de PDFs con `jsPDF` para impresoras láser de oficina, con soporte multipágina y tamaños personalizados (40x30, 58mm, 80mm, A4).
- **Personalización:** Selector de contenido (Solo Barras, Solo QR o Ambos) y layout optimizado para etiquetas pequeñas.

## 🛍️ 4. POS y Catálogo Avanzado
- **Terminal de Venta (POS):** Sincronizado en tiempo real con el stock del backend. Soporte para lectores de barras HID (láser) vía hooks de bajo nivel.
- **Matriz de Variantes:** Generación automática de combinaciones Talle/Color con edición en lote (Batch Edit) y auto-incremento de SKUs.
- **Importación Masiva:** Interfaz dedicada para la carga de hasta 500 productos en un solo movimiento.

## 👥 5. CRM y Perfil Cliente 360
- **Historia Transaccional Unificada:** Una única tabla reactiva que combina Ventas, Devoluciones y Ajustes de Saldo con filtros en memoria.
- **Gestión de Saldos:** Interfaz para registrar deudas y dinero a favor con descripciones obligatorias para auditoría.
- **Motor de Devoluciones:** Interfaz de "arrastrar y soltar" o selección rápida para el intercambio de prendas.

## 📊 6. Dashboard e Insights
- **Datos Reales:** Gráficos y tarjetas de métricas conectados a la API de Telemetría y Salud del sistema.
- **Filtros Temporales:** Visualización de ventas y performance del negocio por rangos de fecha.

---
*(Nota para desarrolladores/IAs: La lógica de negocio reside en `frontend/src/features/`. Consultar `Docs/bitacora-front/features` para el detalle de cada implementación técnica).*
