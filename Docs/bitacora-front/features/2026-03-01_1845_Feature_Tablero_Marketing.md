# Documentación de Funcionalidad: Tablero de Marketing y Perfil Modal 360

**Fecha y Hora:** 2026-03-01_18:45
**Tipo de Cambio:** Nueva Función / Refactor
**Impacto en Multi-tenancy:** No Aplica. Restringido a las barreras UI y las APIs logeadas.

---

## Detalle Técnico

Se demolió el antiguo grid responsivo basado en "Tarjetas de Contacto" del `ClientesPage.tsx` dado que no brindaba herramientas reales de segmentación ni visión densa al operador.

### Cambios realizados
- **Interfaz (UI):** Se implementó una tabla general (re-usando estilos del Catálogo) y un diseño minimalista ordenado por columnas exponiendo a simple vista el `TotalCompras`, `TotalGastado`, `CategoriaPreferida` y el `SaldoAFavor` coloreado condicionalmente (Verde/Rojo).
- **Filtros de Embudo (Funnel):** Se construyó un panel desplegable de filtros que cruzan estas métricas usando el hook `useMemo` en el Frontend a costo 0 de re-renders para crear listados de público objetivo instantáneo (ej: "Clientes que gastaron más de $100K").
- **Visualización Subyacente (`PerfilClientePage`):** Se refactorizó la página del perfil del cliente en 360 para que admita inicializarse bajo un **prop** (`clientIdProp`). De este modo, al hacer clic en un cliente de la tabla masiva, el perfil entero levanta como un overlay Drawer Sliding lateral, sin alterar el DOM de enrrutamiento, sin perder tus filtros de Marketing, y dando una inmersión completa al ecosistema.

---

## Explicación Didáctica
Pensá en la lista de clientes como si fuese tu libreta de contactos del celular.
Antes, veías las tarjetas gigantes con la foto y el número de teléfono, ocupando casi toda la pantalla; si querías buscar a los amigos que "Les gusta el fútbol", tenías que entrar uno a uno para ver qué decían sus perfiles.

Con este cambio, transformamos tu libreta en **un Excel poderoso**. Ahora podés apretar un botón arriba que diga: _«Mostrame sólo a los que le gusta el fútbol y me deben más de mil pesos»_ y la lista se reduce sola.
Además, si querés ver más detalles de un amigo, antes te llevaba a otra página obligándote a "volver atrás"; ahora mismo abrimos un cajoncito lateral con toda la historia de tu amigo para leerla sin tapar el Excel de fondo. ¡Puro Marketing y usabilidad!
