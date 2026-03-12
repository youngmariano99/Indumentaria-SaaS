# Estructura del Frontend (React + TypeScript + Vite) ⚛️

Arquitectura basada en **Feature-Sliced Design** adaptada para soportar múltiples verticales (rubros) mediante un registro dinámico de componentes.

```text
frontend/
├── src/
│   ├── app/                            # Punto de entrada y configuraciones globales
│   ├── core/                           # Lógica core del sistema (Agnóstica al rubro)
│   │   └── registry/                   # ComponentRegistry.ts (Cerebro de la UI Mutante)
│   │
│   ├── features/                       # Módulos de negocio compartidos
│   │   ├── auth/                       # Login y persistencia de RubroSlug
│   │   ├── catalog/                    # Páginas base de carga de productos
│   │   ├── dashboard/                  # Dashboard adaptativo
│   │   └── reports/                    # API de reportes compartida
│   │
│   ├── verticals/                      # 📁 Piezas específicas por cada rubro
│   │   ├── indumentaria/               # Grillas de Talles/Colores, Reportes de Temporada
│   │   └── ferreteria/                 # Grillas de Medidas, Aging Report, Alertas Reposición
│   │
│   ├── hooks/                          # Hooks transversales
│   │   ├── useRubro.ts                 # Hook clave: resolveComponent() y traducciones
│   │   └── useAuth.ts
│   │
│   ├── store/                          # Zustand: rubroStore.ts, authStore.ts
│   ├── components/                     # UI base (Botones, Modales, Inputs)
│   ├── lib/                            # Clientes HTTP (Axios)
│   └── types/                          # Interfaces de TypeScript
```

## Mecanismo de Extensión
1. **Registro:** Cada nuevo componente vertical se registra en `ComponentRegistry.ts`.
2. **Resolución:** Las páginas en `features/` invocan el hook `useRubro().resolveComponent('Key')`.
3. **Inyección:** El sistema inyecta el componente correspondiente al rubro del usuario, manteniendo la página principal limpia y reutilizable.
