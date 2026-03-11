---
Tags: #Modulo_Seguridad, #Importancia_Critica, #Area_Backend, #Nivel_Seguridad_Alto
---

# Feature: Blindaje de Datos - Row-Level Security (RLS) e Índices GIN

**Fecha y Hora:** 2026-03-10 20:20
**Tipo de Cambio:** Nueva Función / Infraestructura

## Propósito
Migrar el aislamiento de datos del SaaS de una lógica puramente basada en software (Global Query Filters de EF Core) a una seguridad nativa del motor de base de datos PostgreSQL (Row-Level Security). Esto garantiza que ningún inquilino pueda acceder a datos de otro, incluso si hay errores en el código del servidor. Además, se habilitó el soporte para metadatos flexibles (Multi-Rubro) mediante campos JSONB indexados.

## Impacto en Multi-tenancy
- **Aislamiento Físico:** Se habilitó RLS en 15 tablas core (Productos, Ventas, Clientes, etc.).
- **Políticas de Seguridad:** Se implementó la política `tenant_isolation_policy` que valida el `TenantId` contra la variable de sesión `app.current_tenant`.
- **Persistencia Segura:** El `TenantSessionInterceptor` ahora utiliza `SET LOCAL`, limitando la identidad del inquilino estrictamente a la duración de la transacción actual del pool de conexiones.

## Detalle Técnico
1. **Entidad Producto:** Agregada propiedad `MetadatosJson` para soportar campos variables según el rubro del negocio.
2. **DbContext:**
   - Configuración de `HasColumnType("jsonb")` para `MetadatosJson` y `AtributosJson`.
   - Implementación de índices **GIN** para permitir búsquedas eficientes dentro de los objetos JSON.
3. **Migración `20260310231256_MigrateToRLSAndGINIndices`:**
   - SQL imperativo para ejecutar `ENABLE ROW LEVEL SECURITY` y `FORCE ROW LEVEL SECURITY`.
   - Creación de índices específicos Npgsql.

---

## Explicación Didáctica
Imaginá que antes el sistema era como un bibliotecario (EF Core) que te traía solo tus libros porque él era ordenado. Ahora, instalamos **cajas de seguridad individuales** directamente en las estanterías (PostgreSQL RLS). 
Aunque el bibliotecario se equivoque, la estantería ni siquiera te va a mostrar que existen los libros de otro cliente porque no tenés la llave (la sesión del `TenantId`).

Además, le dimos a los productos una "mochila mágica" (`MetadatosJson`). Si sos una zapatería, en la mochila podés guardar el tipo de suela; si sos una ferretería, guardas el material de la tuerca. Y gracias a los índices GIN, el sistema puede encontrar lo que hay dentro de esas mochilas a la velocidad de la luz.

Archivos clave:
- `ApplicationDbContext.cs`: Donde se configuró la "mochila" y los índices.
- `Producto.cs`: Donde se cosió la nueva parte de la mochila al modelo.
- `MigrateToRLSAndGINIndices.cs`: El plano de obra para instalar las cajas de seguridad en la base de datos.
