Actúa como un Arquitecto de Software Principal. Necesito estructurar el código fuente de nuestro SaaS (.NET 8 y React) para soportar múltiples verticales comerciales (Indumentaria, Ferretería, Gastronomía) sin generar código espagueti.

Quiero implementar un Monolito Modular / Vertical Slices en el backend y Feature-Sliced Design en el frontend, maximizando la reutilización del código base genérico y aislando la lógica específica de cada rubro.

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR:

1. ESTRUCTURA BACKEND (.NET 8):

Define la estructura de carpetas exacta separando Core (compartido) y Verticals (específico).

Dame un ejemplo de cómo implementar el Patrón Estrategia (Strategy Pattern) con Inyección de Dependencias dinámica basada en el TenantId o Rubro. Usa como ejemplo un servicio IValidadorProducto que tenga implementaciones distintas para Indumentaria y Ferretería, y muestra cómo registrar esto en el Program.cs o DependencyInjection.cs.

2. ESTRUCTURA FRONTEND (React):

Define la estructura de carpetas usando Feature-Sliced Design (shared, core, features, verticals).

Crea un ejemplo de un componente "Híbrido" (ej. FormularioProductoBase.tsx). Este componente debe importar la estructura visual genérica desde shared, pero inyectar dinámicamente un sub-componente específico (como la grilla de variantes) desde la carpeta verticals usando React.lazy() y un ComponentRegistry basado en el contexto del rubro actual.

3. REGLAS DE ORO:

Quedan estrictamente prohibidos los condicionales estáticos (if rubro == 'X') dentro de la lógica de negocio core o los componentes visuales base. Todo debe resolverse por interfaces en el back y por registro dinámico en el front.