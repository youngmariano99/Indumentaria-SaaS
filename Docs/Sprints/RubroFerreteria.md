# Hoja de Ruta (Sprints): Vertical FERRETERÍA

Este documento detalla la secuencia lógica de implementación para montar el entorno 100% operativo de la primera gran variante del SaaS Multi-Todo: **La Ferretería**.

A diferencia de la Indumentaria, este rubro destaca por su alta densidad de variables técnicas, compras y devoluciones fraccionadas, carga masiva constante y una búsqueda en POS extremadamente veloz y tolerante a fallos.

---

## 📅 Sprints de Implementación

### Sprint 1: Motor Base & Diccionario de Configuración [COMPLETADO]
*Foco: Preparar el terreno para que el sistema hable en términos técnicos (Materiales, Medidas, Presentaciones).*
- **Backend:** 
  - [x] Crear Entidad `AtributoConfiguracion` (Diccionario Universal).
  - [x] Inyector automático de Seed Data al dar de alta un tenant Ferretero.
- **Frontend:**
  - [x] Componente `AttributeGroupManager` para administrar chips/pills.
  - [x] Generación y Cacheo del "EsquemaBase" para inyectarlo en formularios.

### Sprint 2: Categorías Jerárquicas y Herencia de Metadatos
*Foco: Árbol taxonómico de N-Niveles (ej. Herramientas > Eléctricas > Taladros).*
- **Backend:**
  - Añadir soporte jerárquico (`ParentId`) a `Categoria`.
  - Columna `EsquemaAtributosJson` y algoritmo de herencia recursiva.
- **Frontend:**
  - Componente `CategoryTreeView`.
  - Creación de sub-categorías "al vuelo" desde modales.

### Sprint 3: Catálogo - Carga Masiva y Grilla Técnica
*Foco: UX diseñada para ingresar miles de productos a máxima velocidad.*
- **Frontend:**
  - **Generador Combinatorio Técnico:** El usuario elige Medida + Presentación, y el sistema cruza un array en memoria al instante.
  - **Edición Estilo Planilla (Grid Editing):** Variantes editables con teclado (flechas) sin salir del formulario.
  - Componente OCR Básico (MVP) para procesar etiquetas/facturas de compra rápidas.
- **Backend:**
  - Endpoint `ImportarCatalogoFerreteriaCommand` especializado en validación y mapeo CSV/Excel -> JSONB.

### Sprint 4: Punto de Venta (POS) - Alta Velocidad & Fraccionamiento
*Foco: Vender en segundos tolerando métricas fraccionadas y errores de tipeo.*
- **Backend:**
  - `BuscarProductosPosQuery`: Búsqueda de alta velocidad usando pg_trgm difuso sobre `Nombre` y `AtributosJson`.
- **Frontend:**
  - Ingreso de Cantidades Decimales con popovers dinámicos basados en la flag `EsFraccionable`.
  - Botón "Ítem Vario" para ventas rápidas de mostrador sin inventario estricto.
  - Integración Web Serial API (futuro) para balanzas.

### Sprint 5: Devoluciones Fraccionadas y Módulo de Cuentas Corrientes
*Foco: Gestión precisa de notas de crédito y defectuosos.*
- **Backend:**
  - Modificación de inventario para soportar "Stock Defectuoso/Garantía".
  - Entidad `MovimientoCuentaCorriente` para saldo a favor (Notas de Crédito) y Fiados.
- **Frontend:**
  - Modal de devoluciones que recupere el ticket rápidamente y permita definir el destino de la mercadería por línea de ítem.

### Sprint 6: Arqueos y Explotación Financiera
*Foco: Inteligencia de Negocio orientada al reaprovisionamiento, no a la "temporada".*
- **Backend/DB:**
  - `GetProductosBajoStockQuery`: Alerta precisa de quiebre de stock ligada a tiempos de reposición de proveedor.
  - Query de Valorización de Inventario (Suma de Costo * StockActual) estructurada por Categoría.
- **Frontend:**
  - Dashboard de Caja con separación visual dura entre "Cobranzas de Deudas de Cuentas Corrientes" y "Ventas Diarias Puras".
  - Aging Report (Ranking de Morosidad de Clientes).

---

> El equipo no avanzará al siguiente sprint sin verificar (via testing) que la arquitectura modular se mantenga.