```markdown
# Seguridad: Protección de Datos y Soberanía
En un entorno multi-tenant, la seguridad no es solo evitar hackeos, sino garantizar que los datos de un cliente jamás se mezclen con los de otro.

## Backend (Lógica y Datos)
*   **Row Level Security (RLS) en PostgreSQL (+3):** Implementar políticas a nivel de base de datos para que cada consulta esté filtrada por `tenant_id` de forma nativa e ineludible.
*   **Aislamiento de Claves HSM/Azure Key Vault (+1):** Las claves privadas (`.key`) de ARCA deben vivir fuera de la base de datos principal, en una bóveda cifrada, siendo accedidas solo por un microservicio de firma digital.
*   **Auditoría Inmutable (JSONB):** Registrar cada cambio de estado y respuesta de ARCA en formato JSONB para peritajes legales, asegurando la trazabilidad de punta a punta.
*   **JWT con Claims de Tenant (+1):** Los tokens de acceso deben llevar el `TenantId` incrustado y firmado, permitiendo que el middleware fiscal valide la identidad antes de cualquier operación.

## Frontend (Interfaz y Cliente)
*   **Acceso por PIN de Usuario:** Implementar cambios rápidos de operario mediante PINs de seguridad, permitiendo rastrear ventas individuales para comisiones sin cerrar sesión.
*   **Sanitización de Entradas (+1):** Validación estricta en React para evitar inyecciones de código, especialmente en campos de descripción de productos o carga masiva.
*   **Gestión Segura de Sesión:** Almacenamiento de tokens en `HttpOnly Cookies` o memorias volátiles del navegador para mitigar ataques XSS.

---

# ⚡ Eficiencia: Rendimiento y Experiencia de Usuario
La eficiencia se mide en milisegundos de respuesta y en la cantidad de "clics" que le ahorrás al usuario. (+2)

## Backend (Rendimiento y Despliegue)
*   **Source Generators (.NET 8):** Utilizar generadores de código para la serialización XML de ARCA, eliminando la reflexión y reduciendo drásticamente el uso de CPU y memoria.
*   **Estrategia de Caché con Redis:** Almacenar los Tickets de Acceso (TA) de ARCA y datos de configuración del tenant en memoria para evitar consultas recurrentes a la base de datos.
*   **Idempotencia y Reintentos (+1):** Implementar backoff exponencial para errores de red, asegurando que si una factura se envió pero la respuesta falló, el sistema recupere el CAE sin duplicar la venta.
*   **CQRS (MediatR):** Separar las lecturas de las escrituras para que el dashboard de rentabilidad no afecte la velocidad del punto de venta durante el cobro.

## Frontend (UX y Mobile-First)
*   **Arquitectura Offline-first (+2):** Uso de una base de datos local (SQLite/Room) para procesar ventas y escanear productos sin latencia, sincronizando con la nube en segundo plano.
*   **Diseño "Thumb Zone" (+1):** Colocar los botones de acción principal (cobrar, buscar, escanear) en la parte inferior de la pantalla para operar el celular o tablet con una sola mano.
*   **Carga Masiva Matricial (+1):** Interfaz de grilla visual para ingresar stock de talles y colores de una sola vez, reduciendo el error manual en un 40%.
*   **Lazy Loading y Code Splitting (+1):** Cargar solo los módulos necesarios (ej. no cargar el módulo de ajustes si el usuario está en el POS) para garantizar fluidez en dispositivos de gama media.
```