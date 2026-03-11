---
Tags: #Modulo_Arquitectura, #Importancia_Alta, #Area_Frontend, #Nivel_SaaS_2.0
---

# Feature: Diccionario de Dominio Dinámico (Frontend)

**Fecha y Hora:** 2026-03-10 20:45
**Tipo de Cambio:** Nueva Función / Refactor

## Propósito
Permitir que la interfaz de usuario hable el "dialecto" de cualquier rubro comercial (Indumentaria, Ferretería, etc.) sin cambiar el código fuente de los componentes.

## Impacto en Multi-tenancy
- **Identidad de Marca:** Un inquilino de una zapatería ve etiquetas como "Par de Calzado" mientras que uno de una farmacia ve "Medicamento", compartiendo la misma base de código React.
- **Transparencia:** El sistema de traducción es automático y reactivo; los componentes solo piden una clave y el motor devuelve el término adecuado según el rubro inyectado en el login.

## Detalle Técnico
1. **`rubroStore.ts`:** Store de Zustand que almacena el `diccionario` (Record<string, string>) recibido del backend.
2. **Hook `useRubro`:** Provee la función `t(key, fallback)` que busca traducciones en el store.
3. **Persistencia:** Integración con `persist` de Zustand para que el lenguaje del rubro se mantenga incluso al recargar la página (F5) sin sesiones extras.

---

## Explicación Didáctica
Le pusimos un **oído selectivo** a la aplicación. 
Antes, React tenía todos los nombres grabados en piedra (harcoded). Ahora, cuando el usuario entra, el servidor le susurra un **manifiesto de nombres**. 
Si el servidor dice "desde ahora a los Productos los llamamos Insumos", el hook `useRubro` se encarga de que cada botón, título y mensaje de la App use esa palabra. Esto hace que la misma App se sienta personalizada para cada cliente sin haber programado 100 versiones distintas.

Archivos clave:
- `rubroStore.ts`: La memoria donde guardamos los nombres que nos dice el servidor.
- `useRubro.ts`: El traductor que usan todos los componentes.
