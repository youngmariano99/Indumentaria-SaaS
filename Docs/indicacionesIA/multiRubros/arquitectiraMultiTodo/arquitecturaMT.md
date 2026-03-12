Actúa como un Arquitecto de Software Principal (Staff Engineer). Nuestra misión es refactorizar nuestro SaaS actual (.NET 8, EF Core 8, PostgreSQL, React PWA) hacia una arquitectura verdaderamente "Multi-Todo" (Multi-Inquilino, Multi-Sucursal, Multi-Usuario y Multi-Rubro).
El objetivo es lograr una escalabilidad bestial donde agregar un nuevo rubro comercial tome solo semanas configurando metadatos, eliminando el "code smell" de condicionales estáticos (Shotgun Surgery) en el código.

DIRECTRICES ESTRICTAS DE ARQUITECTURA QUE DEBES IMPLEMENTAR:

1. BASE DE DATOS Y SEGURIDAD (PostgreSQL)

Aislamiento RLS: Abandona los Global Query Filters puros. Implementa Seguridad a Nivel de Fila (Row-Level Security) nativa en PostgreSQL. Crea un rol sin privilegios BYPASSRLS y políticas de visibilidad estrictas (CREATE POLICY ... FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::UUID)).

Esquemas Dinámicos: Utiliza el tipo JSONB nativo para atributos variables de productos. Para garantizar búsquedas sub-milisegundo, debes obligatoriamente configurar índices GIN a través del Fluent API de EF Core (HasMethod("gin")) y soportar búsquedas difusas habilitando la extensión pg_trgm.

2. BACKEND (.NET 8 Y EF CORE)

Interceptor de Inquilino: Crea un DbConnectionInterceptor en EF Core que inyecte SET LOCAL app.current_tenant = 'UUID' al abrir la conexión, asegurando que el contexto persista solo durante la transacción y previniendo fugas de datos.

Motor de Feature Toggles Jerárquico: Implementa un sistema de banderas que evalúe permisos en este orden: Rubro -> Inquilino -> Sucursal -> Usuario. Usa el patrón DataKey (ej. 1.3.7.) para manejar la herencia de configuraciones mediante operadores StartsWith. Este sistema debe cachearse agresivamente (Redis + MemoryCache de Nivel 1) mediante un IFeatureResolver inyectado como Singleton.

Diccionario de Dominio Dinámico: Sobrescribe la interfaz IStringLocalizer nativa de ASP.NET Core. El backend debe interceptar las respuestas HTTP mediante un Middleware y adjuntar un diccionario (ej. cambiar "Producto" por "Prenda" o "Tornillo" según el rubro del inquilino), dejando al frontend como un "receptor ciego".

3. FRONTEND MUTANTE (React PWA)

Metadata-Driven UI: Queda estrictamente prohibido usar condicionales if (rubro === 'panaderia') en el renderizado. El backend enviará un Manifiesto JSON (Schema Registry) al autenticar.

Patrón Strategy & Factory: Implementa un Component Registry (un mapa en memoria). Las vistas deben ser carcasas genéricas que utilizan una función de orden superior (FieldFactory) para iterar el JSON y buscar el componente React correspondiente en el registro.

Limpieza Visual Extrema (Code Splitting): Acopla el registro de componentes con React.lazy() e importaciones dinámicas (import()). Si el Feature Toggle del backend indica que el inquilino no usa "Malla de Talles", la PWA jamás debe descargar ese paquete JavaScript, optimizando el Time to Interactive (TTI).

4. EXPERIENCIA DE USUARIO (UX)

Divulgación Progresiva: Diseña los formularios (ej. Alta de Producto) ocultando la complejidad inicial. Muestra solo 3 campos vitales. Todo lo demás (medidas, impuestos avanzados) debe residir en cajones laterales o menús desplegables bajo demanda con "Smart Defaults" pre-poblados.

Estados Vacíos Accionables: No renderizar tablas vacías. Cuando un módulo no tiene datos, implementa patrones educativos, colaborativos o "Data-Seeded" (fondos difuminados con datos hipotéticos) rematados con un claro Call-to-Action y Micro-copy inyectado desde el backend.



--------------------------------------------------------------------------


1. La Estructura del Backend (.NET 8): Monolito Modular
En lugar de tener una carpeta gigante de Services donde se mezcla la ropa, los tornillos y las empanadas, vas a separar tu código en "Rebanadas Verticales" (Vertical Slices).

La regla de oro: El núcleo (Core) dicta las reglas, y los rubros (Verticales) las implementan.

Tu estructura de carpetas en C# debería verse más o menos así:

📁 src/Core/ (Lo que usan todos: Autenticación, TenantId, Entidad Producto base, POS base)

📁 src/Verticals/

📁 Indumentaria/ (Lógica de matrices de talles y colores)

📁 Ferreteria/ (Lógica de fraccionamiento, importación masiva técnica)

📁 Gastronomia/ (Lógica de combos, fórmulas y recetas para el futuro)

¿Cómo reutilizar sin mezclar? (El Patrón Estrategia)
Nunca uses un if (rubro == "Ferreteria") en tu código base. En su lugar, usas Interfaces.
Por ejemplo, en el Core creás una interfaz IGeneradorSKU.
Luego, en la carpeta de Indumentaria creás GeneradorSkuRopa y en la de Ferretería creás GeneradorSkuTecnico.
Cuando el usuario inicia sesión, la Inyección de Dependencias de .NET lee qué rubro es el inquilino y automáticamente le asigna la clase correcta. El Core siempre llama a generar(), pero la ejecución cambia mágicamente según la carpeta del rubro.

2. La Estructura del Frontend (React): Feature-Sliced Design
En React, el error más común es agrupar por tipo de archivo (todos los componentes en una carpeta, todos los hooks en otra). Eso es un caos. Debes agrupar por funcionalidad.

Tu estructura de React debería ser:

📁 src/shared/ (Tus bloques de lego: Botones, Tablas genéricas, Modales, Inputs)

📁 src/core/ (El esqueleto: Sidebar, Navbar, Login, Contextos de Tenant)

📁 src/features/ (Las funcionalidades compartidas: Clientes, ArqueoCaja)

📁 src/verticals/ (La magia específica)

📁 indumentaria/ (Componente MatrizTallesColores, FiltroTemporada)

📁 ferreteria/ (Componente InputFraccional, GeneradorTecnico)

¿Cómo reutilizar sin mezclar en React? (El Component Registry)
Como vimos en la arquitectura anterior, tu archivo principal del POS importa los botones y tablas de la carpeta shared. Pero cuando llega el momento de renderizar el selector de variantes, usa el Component Registry (carga diferida). Si el inquilino es de ropa, React va a la carpeta verticals/indumentaria/ y carga esa vista. La carpeta de ferretería ni siquiera se descarga en el navegador de ese cliente.