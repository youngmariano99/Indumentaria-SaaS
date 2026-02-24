# Frontend (React + TypeScript + Vite) 
Dado que el POS necesita ser offline-first (con SQLite/IndexedDB) y contar con una UX móvil-first ("Zona del Pulgar"), una arquitectura por "Features" permite escalar las vistas de escritorio (Admin) y las de tablet (POS) manteniendo orden y reusabilidad.

frontend/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── app/                            # Configuración global y punto de entrada
│   │   ├── App.tsx                     # Ruteador principal y Proveedores (Providers)
│   │   └── router.tsx                  # Definición de rutas (React Router)
│   │
│   ├── assets/                         # Imágenes, íconos y estilos globales
│   │   ├── styles/                     # Variables CSS globales, tipografía
│   │   └── icons/                      # SVGs para la "Zona del Pulgar"
│   │
│   ├── components/                     # Componentes reusables "Tontos" (Presentacionales)
│   │   ├── ui/                         # Botones, Inputs, Modales genéricos
│   │   └── layout/                     # Sidebar, Topbar, Layout responsivo
│   │
│   ├── features/                       # Módulos del modelo de negocio de pago (Cohesión alta)
│   │   ├── auth/                       # Lógica de Login y cambio por PIN
│   │   ├── catalog/                    # Carga masiva (matriz de stock)
│   │   ├── pos/                        # Punto de venta (Mobile-first app)
│   │   ├── fiscal/                     # Configuración de ARCA y emisión
│   │   └── wallet/                     # Módulo C: Billetera y devoluciones
│   │
│   ├── hooks/                          # Custom hooks globales
│   │   ├── useTenant.ts                # Info del Inquilino actual y Feature Flags
│   │   └── useSyncManager.ts           # Hook para orquestar la sincronización offline/online
│   │
│   ├── services/                       # Comunicación externa y Base de Datos Local
│   │   ├── api/                        # Configuración de Axios/Fetch y clientes REST
│   │   └── localDb/                    # Implementación de SQLite local para el Offline-First
│   │
│   ├── store/                          # Estado global de la aplicación (Zustand/Redux)
│   │   ├── authStore.ts
│   │   └── posStore.ts                 # Estado del carrito de compra (crítico para offline)
│   │
│   ├── types/                          # Interfaces y Tipos TypeScript compartidos
│   └── utils/                          # Funciones auxiliares genéricas
│       ├── formatters.ts               # Formato de monedas, fechas
│       └── validators.ts               # Validaciones básicas
│
└── tests/                              # Pruebas Frontend (Vitest / Playwright)
    ├── components/
    └── features/
