---
Tags: #Modulo_CRM_Devoluciones, #Importancia_Critica, #Area_Frontend, #Nivel_Seguridad_Medio
---

# Feature: Módulo Visual de Devoluciones y Saldo de Cliente (Compras Recientes)

**Fecha y Hora:** 2026-03-01 18:00
**Tipo de Cambio:** Nueva Función Visual (React)

## Propósito
Crear la UI que permite al cajero/vendedor procesar cambios de mercadería y visualizar de forma expedita las compras anteriores del cliente seleccionado. Este módulo sirve como "Caja de Devolución" e impacta sobre el Stock y la Billetera Interna del usuario (Perfil 360).

## Impacto en Multi-tenancy
- El front requiere estar autenticado (Middleware del Router) portando el JWT que incluye por dentro el TenantId. Esto protege que las variantes de catalogo expuestas a la caja correspondan sólo al inventario de la sede de esa sesión.
- Las llamadas Axios (`posApi` y `clientesApi`) viajan con los interceptores standard que inyectan dicho token para las comprobaciones de backend.

## Detalle Técnico
1. **Componente Nuevo `DevolucionesPage.tsx`:** 
   - Estructura flexbox con 2 paneles centrales (Búsqueda a la izquierda) y (Carrito Diferencial a la derecha). 
   - Renderiza un grid de catálogo de productos globales para intercambios.
2. **Historial Automatizado:**
   - Se añadió un `useEffect([clienteSeleccionadoId])` que fetchea su `Perfil360Dto`. 
   - Dicha carga asíncrona trae un vector de arreglos en formato `CompraRecienteDto > CompraRecienteDetalleDto`.
   - El Array FlatMap recorre todas las listas y fabrica una grilla inicial mostrándole al Cajero exactamente lo último que llevó ese cliente (hasta 15 items), junto con un botón especial "+ Devolver Prenda" que inyecta automáticamente esa variante en la lista de items devueltos sin tener que ir a buscarla manualmente.
3. **Indicadores de Saldo en Perfil Cliente y Caja POS:**
   - La pantalla de visualización del cliente (`PerfilClientePage.tsx`) ahora refleja en verde (positivo) o en rojo (negativo) la plata en cuenta. 
   - El POS principal ahora lee ese saldo para ofrecer si se desea cobrar del mismo total parcial e impactarlo en el Backend para restarlo de su billetera virtual.
4. **Router de React:**
   - `<NavLink to="/devoluciones">` insertado en `AppLayout.tsx`.
   - Componente enlazado en `router.tsx` bajo modo protegido.

---

## Explicación Didáctica
Imagina un "Panel de Mando" para la empleada de la caja. En el medio tiene todos los productos de la tienda, y a la derecha 2 carritos chicos en vez de uno; el de "Arriba" para productos que recibe el local y vuelven a mostrador, y de "Abajo" para los que el cliente decide probarse limpios y llevarse en lugar de los otros. 
La matemática es pura: suma valores de arriba, resta los de abajo, y esa "diferencia" se asienta luego de darle al botón "Aprobar Cierre", donde el sistema llama al mesero experto (Backend) y le encarga asentar esa diferencia de precios directo en el cajón imaginario (Billetera) del usuario.
Además, le facilitamos la vida a la empleada diciéndole **"Si seleccionas a Juan, aquí mismo te muestro sus últimos tickets así cliqueas en devolver al toque en vez de ir a la estantería del software a revolver"**.
