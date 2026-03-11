---
Tags: #Modulo_Seguridad, #Importancia_Media, #Area_Frontend, #Nivel_SaaS_2.0
---

# Feature: State-Driven Feature Toggles

**Fecha y Hora:** 2026-03-10 21:15
**Tipo de Cambio:** Nueva Función / Estado

## Propósito
Centralizar el control de funcionalidades en el frontend mediante un store reactivo (Zustand) que permita ocultar o mostrar componentes basándose en los permisos jerárquicos resueltos por el backend.

## Impacto en UX
- **Interfaz Limpia:** Los usuarios solo ven las herramientas que tienen habilitadas según su plan o rol.
- **Carga Inmediata:** Las configuraciones se obtienen al inicio y se mantienen en memoria, eliminando parpadeos (flickering) al navegar.

## Detalle Técnico
1. **`featureStore.ts`:** Store de Zustand que gestiona el mapa de booleanos `features`.
2. **Hook `useFeatures`:** Hook personalizado para acceso ultra-rápido: `const { isEnabled } = useFeatures()`.
3. **Inicialización:** Integración en el flujo de arranque para poblar el store desde el endpoint `/my-features`.

---

## Explicación Didáctica
Creamos un **tablero de luces** en el frente de la aplicación. 
Cada funcionalidad importante tiene un foco en este tablero. Cuando el usuario entra, la aplicación le pregunta al servidor: "¿Qué focos debo prender para este usuario?". 
El servidor le manda la lista, y el frontend prende las luces. Si un botón o una sección no tiene su luz prendida en el tablero, simplemente no se muestra. Esto nos permite manejar una aplicación gigante de forma muy sencilla.

Archivos clave:
- `featureStore.ts`: El tablero con todos los focos.
- `useFeatures.ts`: La forma en que cada componente mira el tablero para saber si debe mostrarse.
