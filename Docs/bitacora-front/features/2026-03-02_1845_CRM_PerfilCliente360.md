# Bitácora Frontend: UI Perfil Cliente 360 y Tabla Unificada

**Fecha y Hora**: 2026-03-02 18:45
**Tipo de Cambio**: Nueva Función / Bugfix Visual
**Tags**: #Modulo_CRM_POS, #Importancia_Media, #Area_Frontend, #Nivel_Publico

## Impacto Visual y Funcional
Esta feature consolida la experiencia del vendedor con el "Cliente 360". Ahora un Cajero u Operador de Tienda puede entender visualmente toda la vida transaccional del cliente sin ir a otras pestañas o navegar tickets en el vacío.

## Detalle Técnico
- **API y Tipados TypeScript**: Las definiciones de `clientesApi.ts` se modificaron para dejar atrás `CompraRecienteDto` dando lugar a la nueva `TransaccionHistoricoDto` que es agnóstica de si representa una "Venta" o un "Ajuste de Saldo".
- **SweetAlert2 y Requerimientos**: Se actualizaron las funciones interactivas que proveen al cajero la habilidad de sumar o restar Saldo manualmente mediante cajas de texto para que ahora **exijan obligatoriamente** la recolección del string `Descripción` o fallarán.
- **Motor de Paginación y Filtro React**: La tabla del perfil 360 no carga infinitos tickets en el DOM, lo cual podría colgar un celular gama baja. Opera sobre `PAGE_SIZE=6`, e incluye un textbox interactivo de "Búsqueda" (que parsea campos Descripción o TicketId de manera in-memory aprovechando el array estático de descargas iniciales).
- **Bugfixes de UI**: Ocurría que el Modal `Vista Rápida del Cliente` heredaba estilos obsoletos provocando ancho fijo bajo. Se liberó a un `maxWidth` generoso (1050px) y a la tabla de reportes se le adosó `overflow-x: auto; minWidth: 700px;` asegurando que los botones de "Ver Detalles" (el cual renderiza los items vendidos en un Acordeón interno) jamás caigan fuera de la zona de click. Desacoplamos los componentes antiguos en `DevolucionesPage` para que compilen en Vite.

---

## Explicación Didáctica

Anteriormente la vista rápida del cliente era un resumen estático. Ahora es una "caja negra" viva y navegable.

1. **La Fusión en Pantalla**: El cajero abre el perfil e inmediatamente se da cuenta de la historia. Ve filas que dicen "Venta" con un ticket, pero intercalado en el medio con otro color dice "Ingreso de Saldo" en base al dinero a favor que se dejó registrado en Backend. 
2. **"Lupas" sin recargar la página (Filtro Inteligente)**: Imagina que el cliente tiene 50 tickets de historial y queremos buscar esa remera roja que compró. Como está todo en memoria, cuando el vendedor escribe en el buscador, no se hace un llamado al servidor, sino que el propio navegador filtra la tabla como si fuera un Excel instantáneo.
3. **Puntualidad en los Modales (CSS Fix)**: Habíamos puesto una mesa de 10 personas (el ancho de la tabla) en un cuarto para 4 (el Modal antiguo). Expandimos la pared del cuarto virtual y le dijimos a la mesa "Podés habilitar una roldana paralela para mostrar el final de los platos" (`overflow-x`) para que todo quepa cómodamente en cualquier monitor.
