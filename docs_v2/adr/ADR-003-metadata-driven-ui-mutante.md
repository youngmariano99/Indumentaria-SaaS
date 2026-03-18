# ADR-003: Metadata-Driven UI (UI Mutante)

- **Estado**: Aceptado
- **Fecha**: 2026-03-05
- **Autor**: Architect/DX Expert

## Contexto
El sistema evolucionó de una aplicación de **Indumentaria** a un SaaS **Multi-Todo** que debe soportar diferentes industrias (Ferretería, Salud, etc.). Los formularios de alta de productos tienen diferentes campos según el rubro:
-   **Indumentaria**: Talle, Color, Temporada.
-   **Ferretería**: Material, Medida, Fraccionable.

Aumentar este número de rubros mediante condicionales estáticos (`if (rubro === 'indumentaria')`) en React vuelve la base de código ingobernable e infla el tamaño del bundle de JavaScript para todos los clientes sin necesidad.

## Decisión
Implementar el paradigma de **Metadata-Driven UI** o **UI Mutante**. El backend se convierte en el orquestador visual a través de un **Schema Registry (JSON Schema)** centralizado en el `ApplicationCore`.

### Detalles de Implementación:
1.  Cada **Rubro** tiene una configuración de metadatos (JSONB) en PostgreSQL.
2.  Al cargar un formulario, el frontend solicita el esquema al endpoint `/api/categorias/{id}/esquema` o durante la autenticación.
3.  El componente `FieldFactory.tsx` renderiza dinámicamente el input apropiado (Select, Text, Checkbox) leyendo este manifiesto.

## Consecuencias
### Positivas:
- **Escalabilidad Infinita**: Agregar una nueva industria no requiere desplegar una versión del Frontend. Basta con cargar un nuevo JSON en la tabla de Rubros.
- **Eficiencia en el Bundle**: Se eliminan ramas de código muerto para usuarios que no pertenecen a ciertos rubros.
- **Consistencia**: Mantenemos un único componente de formulario para todo el SaaS.

### Negativas:
- **Esfuerzo de Diseño**: El equipo de frontend debe pensar en componentes genéricos de alta calidad (Agnostic Components).
- **Latencia de Carga**: Requiere una petición adicional para obtener el esquema antes de renderizar el primer formulario (mitigado con caché en LocalStorage).
- **Validación Compleja**: Requiere sincronizar las validaciones de `FluentValidation` (Backend) con el esquema recibido en el Frontend.
