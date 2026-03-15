Actúa como un Arquitecto Frontend Senior en React y Experto en UX B2B. Nuestro equipo (AppyStudios) está desarrollando un SaaS ERP/POS Multi-Rubro diseñado para una experiencia "Zero-Training".

El Desafío (Navegación Anti-Fricción):
Necesito estructurar el sistema de navegación (Sidebar, Rutas y Buscador) de nuestra PWA en React. El menú actual se está llenando de opciones y genera "parálisis por análisis". Para solucionarlo, vamos a implementar un menú estrictamente plano (sin listas desplegables), basado en roles, y apoyado por "Dashboard Hubs" y un "Buscador Universal (Omnibar)".

DIRECTRICES ESTRICTAS QUE DEBES IMPLEMENTAR EN REACT:

1. Divulgación Progresiva Basada en Roles (Configuración Dinámica):

Crea un archivo de configuración (ej. navigationConfig.ts) donde se definan las rutas.

Implementa lógica para que el componente Sidebar renderice dinámicamente los botones según el rol del usuario autenticado (ej. rol Cajero vs. rol Admin).

El menú del Cajero debe ser minimalista (solo Ventas, Caja, Buscar Stock). El menú del Admin debe tener las áreas principales (Inventario, Proveedores, Finanzas, Configuración), pero está estrictamente prohibido usar sub-menús desplegables o acordeones en el Sidebar.

2. El Patrón "Dashboard Hub" (Navegación Visual):

Diseña un componente contenedor llamado ModuleHubLayout.

Cuando el Administrador hace clic en "Proveedores" en el menú lateral, no se despliega una lista. En su lugar, navega a la ruta /proveedores, la cual renderiza este ModuleHubLayout.

Este Hub debe presentar el sub-menú como Tarjetas Visuales Gigantes (Cards) en el centro de la pantalla (ej. una tarjeta grande para "Cargar Factura", otra para "Cuentas por Pagar"). Esto favorece el escaneo visual y respeta el tamaño masivo de los "Touch Targets" para usuarios sin destreza tecnológica.

3. Buscador Universal / Omnibar (Estilo Spotlight / Cmd+K):

Diseña el esqueleto y estado global (usando Zustand o Context) para un Omnibar.

Este buscador debe estar siempre visible en la barra superior y activarse con un atajo de teclado (Ctrl+K o Cmd+K).

Debe recibir un diccionario de acciones y rutas. Si el usuario escribe "Anular", el Omnibar debe sugerir "Ir a: Anular Ticket" o "Ir a: Devoluciones", permitiendo una navegación directa que sortea por completo el menú lateral.