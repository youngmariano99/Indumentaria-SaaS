# Sprint: Manual Definitivo del Sistema
**Objetivo:** Consolidar todo el conocimiento técnico, arquitectónico y de diseño en una base de conocimientos centralizada (`Docs/Sistema/`) que sirva como guía maestra para el escalamiento y creación de nuevos módulos.

## 📝 Justificación
A medida que el sistema escala a "Multi-Todo" (Inquilino, Sucursal, Usuario, Rubro), la coherencia técnica es vital. Este manual garantiza que cualquier desarrollo futuro mantenga los estándares de calidad, seguridad y experiencia de usuario ya establecidos.

---

## 📅 Hoja de Ruta del Sprint

### Fase 1: Cimientos de Arquitectura (Backend)
- **Documento:** `01-Arquitectura-Core.md`
- **Contenido:**
    - Explicación de **Clean Architecture** y flujo de MediatR (CQRS).
    - El "Cinturón de Seguridad": Seguridad a nivel de fila (**RLS**) y Multi-Tenancy.
    - El **Motor Multi-Rubro**: Cómo funcionan los diccionarios dinámicos y headers en Base64.
    - Sistema de **Feature Toggles**: Jerarquía de permisos (Inquilino > Sucursal > Usuario).

### Fase 2: Filosofía de Interfaz y Experiencia (Frontend)
- **Documento:** `02-Filosofia-UX-UI.md`
- **Contenido:**
    - Principios de **UX Educativa**: "Zero-Training" y términos vernáculos.
    - Estrategia **Mobile-First** y capacidades **PWA** (Offline, Hardware Sync).
    - **UI Mutante**: Uso de `FieldFactory` y cómo la interfaz se adapta al JSON de metadatos del backend.
    - Estándares de diseño (CSS Modules, Typography, Toast System).

### Fase 3: Catálogo de Capacidades (Módulos)
- **Documento:** `03-Mapa-Modulos.md`
- **Contenido:**
    - Detalle funcional de: Catálogo, POS, CRM, Equipo, Sucursales, Proveedores.
    - Interconexiones críticas (ej: Cómo Factura de Proveedor impacta en el Inventario).

### Fase 4: La Guía Definitiva de Nuevos Módulos (Blueprint)
- **Documento:** `04-Guia-Nuevos-Modulos.md`
- **Contenido:**
    - **Checklist Minuto 0**: Desde la creación de la entidad hasta el registro en el sidebar.
    - Pasos técnicos: Core Entity -> Application Command/Query -> API Controller -> Frontend API/Hook -> Componente UI.
    - Cómo inyectar la UX Educativa y el soporte Multi-Rubro en el nuevo módulo.

---

## ✅ Entregable Final
Una carpeta `Docs/Sistema/` que funcione como el punto de entrada para cualquier nuevo colaborador o para nosotros mismos al expandir el negocio, evitando "desentonar" con el resto de la web.
