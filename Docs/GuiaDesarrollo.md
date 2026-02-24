
Manual de Colaboración: Proyecto SaaS Indumentaria ARG
1. Filosofía de Desarrollo y Lenguaje

Lenguaje "Con Cancha": Todos los nombres de funciones, interfaces y entidades deben ser descriptivos y en español latinoamericano (Argentina).


Tecnicismos Globales: Se mantienen en inglés únicamente los términos estándar de la industria (ej. Middleware, Controller, TenantId, JWT, Repository, SOAP).


Ejemplos de Nomenclatura:

✅ ObtenerStockPorTalleYColor en lugar de GetStock.

✅ ProcesarNotaDeCreditoDevolucion en lugar de ProcessRefund.

✅ ValidarCondicionIvaReceptor (término específico de ARCA).

2. Estructura y Orden del Código

Clean Architecture: El código debe respetar estrictamente la separación de capas: Dominio (entidades puras), Aplicación (casos de uso/MediatR), Infraestructura (persistencia/ARCA) y API.

Documentación en Código: Cada módulo o función compleja debe incluir un comentario de cabecera detallando:

Propósito: ¿Qué problema del negocio resuelve?

Lógica: Explicación breve del flujo.

Dependencias: Qué otros servicios o entidades toca.

3. Protocolo de Documentación Obligatorio (/docs)
Cada nueva funcionalidad, corrección o cambio técnico debe generar una actualización automática en la carpeta /docs.

Formato de Archivo: YYYY-MM-DD_HHmm_Modulo_DescripcionCorta.md (Ej: 2026-02-24_1830_Fiscal_IntegracionFCE.md).

Contenido Mínimo del Documento:

Fecha y Hora: Exacta de la realización.

Tipo de Cambio: (Nueva Función / BugFix / Refactor).


Impacto en Multi-tenancy: ¿Cómo afecta el aislamiento de datos o los permisos por tenant?.


Detalle Técnico: Cambios en la DB (PostgreSQL) o nuevas dependencias de .NET Core.

4. Organización y Filtrado de Información
Para facilitar el rastreo y la auditoría "de punta a punta", la documentación debe organizarse por tags o metadatos al inicio de cada archivo:

Tags Requeridos: #Modulo_Nombre, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad.

Estructura de Carpetas:


/docs/fiscal: Todo lo referente a ARCA y cumplimiento legal.



/docs/operaciones: Stock por matriz, locales y ventas.


/docs/arquitectura: Multi-tenancy, RLS y seguridad global.

5. Estándares de Seguridad y "Misión Crítica"

Módulo ARCA: Es una "Fortaleza de Flujo de Trabajo". La IA debe priorizar la indempotencia y la resiliencia (reintentos con backoff exponencial) en cada propuesta de código fiscal.


Privacidad Total: Cualquier sugerencia debe incluir el filtrado por TenantId y respetar el Row Level Security (RLS) de PostgreSQL para evitar fugas de datos sensibles.