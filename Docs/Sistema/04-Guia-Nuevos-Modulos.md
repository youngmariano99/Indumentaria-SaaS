# Guía Definitiva: Crear un Nuevo Módulo

Esta guía establece el estándar para agregar cualquier funcionalidad mayor al ecosistema de Indumentaria-SaaS, garantizando que sea Multi-Tenant, Multi-Rubro y compatible con la UX Educativa.

---

## 🛠️ Paso 1: Infraestructura Backend (Core & Data)
1. **Definir la Entidad en `Core/Entities`**: 
   - Debe heredar de `BaseEntity`.
   - **Nombrado ("Con Cancha")**: Usa nombres en español que representen el negocio (ej: `OrdenProduccion`, no `ProductionOrder`).
   - **Obligatorio**: Implementar `IMustHaveTenant` (para RLS automático).
   - Opcional: Implementar `ISoftDelete` para bajas lógicas.
2. **Registrar en `IApplicationDbContext`**: Agregar el `DbSet<TuEntidad>`.
3. **Migración**: Ejecutar `dotnet ef migrations add NombreMigracion --project Infrastructure --startup-project API`.

## 🧠 Paso 2: Lógica de Aplicación (CQRS)
Crea una carpeta en `Application/Features/NombreModulo`:
1. **DTOs**: Define qué viaja por la red (Requests/Responses).
2. **Commands/Queries**:
   - Usa `MediatR` para las acciones.
   - **Validaciones**: Crea un `Validator` usando `FluentValidation`.
   - **Excepciones**: Si hay un error de lógica, lanza una `BusinessException` (esto devuelve un mensaje amigable al usuario con código 400).
3. **Handlers**: El lugar donde ocurre la magia. Asegúrate de que toda consulta respete el aislamiento de datos (aunque EF Core lo hace por defecto con RLS).

## 🌍 Paso 3: Exposición de API (Controllers)
1. Crea el `Controller` en el proyecto API.
2. **Seguridad**: Usa `[Authorize]` y, si es necesario, `[Authorize(Roles = "Owner")]`.
3. **Feature Toggles**: Si el módulo es opcional, inyecta `IFeatureResolver` y verifica:
   ```csharp
   if (!await _featureResolver.IsEnabledAsync("MiModulo")) return Forbid();
   ```

## 📡 Paso 4: Sincronización Frontend (API & Hooks)
1. **API Client**: Crea `miModuloApi.ts` en `features/miModulo/api/`.
2. **Hook de React Query**: Crea `useMiModulo.ts`. Esto maneja el caché, los estados de carga (`isLoading`) y las mutaciones.
   *Tip: No olivdes invalidar las queries después de un comando exitoso.*

## 🎨 Paso 5: Interfaz de Usuario (UI & UX)
Para que el módulo no se sienta "desconocido":
1. **Principios UX**:
   - Usa `Smart Defaults` para que el usuario trabaje menos.
   - Implementa **UX Educativa**: Si el listado está vacío, muestra un estado amigable.
   - **Undo**: Agregá soporte para deshacer acciones si borras algo.
2. **Responsividad**: Verifica que funcione en mobile (los botones de acción deben estar abajo o ser fácilmente clickeables).
3. **Soporte Multi-Rubro**: Nunca uses textos harcodeados para etiquetas de producto. Usa `translate('Termino')` del `rubroStore`.

## 🧭 Paso 6: Integración y Registro
1. **Sidebar**: Registra el nuevo acceso en `AppLayout.tsx`.
2. **Protección**: Envuelve el acceso en un condicional de permisos:
   ```tsx
   {isOwner || canSeeMiModulo && (
       <NavLink to="/mi-modulo" ... />
   )}
   ```

---

## ✅ Checklist de Salida (Definición de Terminado)
- [ ] ¿La entidad tiene `TenantId`?
- [ ] ¿Los nombres de métodos/clases son en español ("Con Cancha")?
- [ ] ¿Los errores de negocio usan `BusinessException`?
- [ ] ¿El formulario es responsive?
- [ ] ¿Se usó `diccionario` para los términos de industria?
- [ ] ¿Hay un estado vacío descriptivo si no hay datos?
- [ ] ¿Se incluyó la **Explicación Didáctica** en la bitácora del módulo?
- [ ] ¿El código sigue el patrón CQRS/Clean Arch?
