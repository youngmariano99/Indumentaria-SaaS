---
Tags: #Modulo_Catalog, #Importancia_Alta, #Area_Frontend, #Nivel_SaaS_2.0
---

# Feature: UI Mutante - FieldFactory Dinámico

**Fecha y Hora:** 2026-03-10 22:30
**Tipo de Cambio:** Refactor de UI / Motor de Formit

## Propósito
Eliminar la dependencia de formularios estáticos mediante la creación de un motor de renderizado (`FieldFactory`) que construye la interfaz en tiempo de ejecución basándose en la configuración del rubro del inquilino.

## Impacto en UX
- **Relevancia Total:** El usuario solo ve campos que tienen sentido para su negocio. Un vendedor de ropa ve "Talle/Color", un ferretero verá "Voltaje/Material" sin que hayamos tenido que programar dos pantallas distintas.
- **Consistencia Visual:** Todos los campos dinámicos comparten los mismos estilos, validaciones y feedback, garantizando una experiencia premium.

## Detalle Técnico
1. **`FieldFactory.tsx`:** Componente que mapea tipos JSON (`text`, `number`, `select`, etc.) a componentes React persistentes.
2. **`rubroStore.ts`:** Persistencia persistente del esquema de metadatos recibido durante el login.
3. **Refactor `NuevoProductoPage`:** Sustitución de bloques de código estáticos por un `.map()` que itera sobre el esquema dinámico.

---

## Explicación Didáctica
Convertimos el formulario de productos en un **juego de piezas intercambiables**. 
En lugar de tener una pantalla dibujada a mano que nunca cambia, creamos un **robot constructor** (FieldFactory). Cuando abrimos la página, el robot lee los planos (el esquema del Rubro) y arma la pantalla en el momento usando piezas de Lego (inputs estándar). 
Si queremos agregar un campo nuevo, solo cambiamos el plano en la base de datos y el robot lo armará solo la próxima vez que alguien abra la página.

Archivos clave:
- `FieldFactory.tsx`: El robot constructor de pantallas.
- `rubroStore.ts`: Donde guardamos los planos que nos mandó el servidor.
- `NuevoProductoPage.tsx`: La "mesa de trabajo" donde el robot arma el formulario cada vez.
