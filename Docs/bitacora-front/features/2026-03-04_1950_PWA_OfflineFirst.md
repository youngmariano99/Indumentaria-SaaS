# Ticker: PWA - Estabilización Offline-First (Local-First Architecture)

**Fecha y Hora:** 2026-03-04 19:50
**Tipo de Cambio:** Feature de Infraestructura Front-end
**Tags:** #Modulo_PWA, #Offline_First, #IndexedDB, #Mision_Critica

## Impacto Transaccional
Este es probablemente el avance más crítico en materia de "tranquilidad" de usuario de toda la plataforma. El módulo "Punto de Venta" ahora es resiliente e inmune a cortes de internet, preservando instantáneamente las ventas y el catálogo de forma local y conciliándolas cuando la línea se restablece de fondo, de forma transparente.

## Detalle Técnico
1. **Base de Datos Embebida (Dexie.js)**: En `db.ts`, modelamos una DB NoSQL en el almacenamiento del navegador (`IndexedDB`) inicializando `productos` y la vital `syncQueue`.
2. **Replica Local (Catálogo en Cache Inmediato)**: Se reescribió el arranque de `PosPage.tsx`. En lugar de depender obligadamente de Axios.get() a C# y demorar 2 segundos, usa `useLiveQuery` atado a Dexie. En un proceso asíncrono secundario (`posApi.sincronizarCatalogoLocal`), la aplicación le pide los datos más limpios a C# y sobrescribe a Dexie.
3. **Controlador de Fallos por Red (Cola PENDING)**: En `posApi.cobrarTicket`, bloqueamos los `500 Server Errors` por Red (`navigator.onLine === false` o capturando `ERR_NETWORK`). Cuando algo falla ahí, el payload de la venta *no se pierde*, sino que toma vuelo a la tabla local `syncQueue` con un status "PENDING" y le da el [OK] al Vendedor para que libere la caja.
4. **Sincronizador Automático (Manager)**: El hook inteligente `useSyncManager.ts` escucha permanentemente las interrupciones del sistema operativo (`window.addEventListener('online')`). Apenas percibe que el módem levanta, captura todos los registros "PENDING", hace la petición original a C#, constata el éxito y borra el registro de la tabla local.
5. **Modo Alerta en Navbar**: `AppLayout.tsx` muestra carteles preventivos ("⚠️ Operando sin Internet") y badge azul ("☁️ Sincronizando...") en el centro de la pantalla advirtiendo el riesgo al cliente.

## Explicación Didáctica
Si estás cobrando con varias personas haciendo fila y, de repente, un camión arranca los cables de fibra telefónica cerca de la tienda:
1. Ya **no te salta el alerta rojo gigante** de "Fallo conexión API" o pantalla de muerte que te paraliza.
2. Vos tipeás el código de un jean, y aparece al microsegundo. ¿Por qué? Porque el sistema lee el catálogo escondido en la memoria de tu propio equipo.
3. Pretás [Cobrar]. El sistema se da cuenta que está sin red y dice: *"Perfecto, guardo el ticket de pago en el disco local y yo me encargo de subirlo a la Central después"*. Te libera la pantalla para seguir atendiendo.
4. Vas a ver un cartelito amarillo en el techo: **"Aviso: Estás operando sin conexión"**.
5. Cuando vuelve la luz o te pasás los datos del celular, el cartelito dice **"Sincronizando 3 ventas pendientes..."** e inmediatamente después *"Sincronizado"*. ¡Vos jamás frenaste de trabajar y el stock contable corporativo igual te cerró perfecto!
