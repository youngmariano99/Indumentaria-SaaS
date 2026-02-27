# Guía de Sincronización de Base de Datos — Migraciones EF Core
**Fecha:** 27/02/2026  
**Para:** Desarrolladores que clonan el proyecto por primera vez o sincronizan su base local con la historia de migraciones.

---

## Contexto

Este proyecto usa **Entity Framework Core** con **PostgreSQL (Neon)** como base de datos. Cada cambio en el esquema se registra como una migración en:

```
backend/src/Infrastructure/Migrations/
```

Estas migraciones son la fuente de verdad del esquema. **Nunca toques las tablas directamente en Neon** — siempre usá EF migrations.

---

## Historial de Migraciones (en orden cronológico)

| # | Nombre | Fecha | Tablas afectadas |
|---|---|---|---|
| 1 | `InitialCreate` | 24/02/2026 | `Inquilinos`, `Usuarios`, `Roles`, `Productos`, `VariantesProducto`, `Inventarios`, `LogsAuditoria` |
| 2 | `AddMarcasTable` | 25/02/2026 | `Marcas` |
| 3 | `AddCreatedAtToMarcas` | 26/02/2026 | `Marcas.CreatedAt` |
| 4 | `AddTipoProductoYStockInicial` | 27/02/2026 | `Productos.TipoProducto` |
| 5 | `AddConfiguracionTallesJson` | 27/02/2026 | `Inquilinos.ConfiguracionTallesJson` |
| 6 | `AddAtributosJsonYConfiguracionAtributos` | 27/02/2026 | `VariantesProducto.AtributosJson`, `Inquilinos.ConfiguracionAtributosJson` |

---

## Procedimiento para Sincronizar tu Base de Datos Local

### Prerequisitos

1. **.NET 9 SDK** instalado (`dotnet --version` → debe mostrar `9.x.x`)
2. **dotnet-ef tool** instalado globalmente:
   ```powershell
   dotnet tool install --global dotnet-ef
   ```
3. **Cadena de conexión a PostgreSQL** configurada. El archivo debe existir en:
   ```
   backend/src/API/appsettings.Development.json
   ```
   Con este formato (pedirle al equipo la cadena de Neon o usar tu propia instancia local):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
     }
   }
   ```

### Paso 1 — Clonar y restaurar dependencias

```powershell
git clone https://github.com/tu-org/Indumentaria-SaaS.git
cd Indumentaria-SaaS/backend
dotnet restore
```

### Paso 2 — Verificar las migraciones pendientes

```powershell
dotnet ef migrations list --project src/Infrastructure --startup-project src/API
```

Las migraciones con `(pending)` son las que aún no se aplicaron a tu BD.

### Paso 3 — Aplicar todas las migraciones

```powershell
dotnet ef database update --project src/Infrastructure --startup-project src/API
```

Si sale `Done.` al final → ✅ éxito.

### Paso 4 — Verificar que el backend levanta

```powershell
cd src/API
dotnet run
```

Debería arrancar en `https://localhost:7000` (o el puerto configurado). Accedé a `https://localhost:7000/swagger` para ver los endpoints.

---

## Procedimiento para Generar una Nueva Migración

> ⚠️ **Importante:** Antes de generar una migración, **el proceso `dotnet run` debe estar detenido**. EF necesita compilar la API y si está corriendo bloquea el `.dll`.

```powershell
# 1. Detener el proceso si está corriendo (o cerrá la terminal donde corre)
Stop-Process -Name "API" -ErrorAction SilentlyContinue

# 2. Generar la migración
dotnet ef migrations add NombreDescriptivoDeLaMigracion `
  --project src/Infrastructure `
  --startup-project src/API

# 3. Aplicar a la BD
dotnet ef database update --project src/Infrastructure --startup-project src/API

# 4. Volver a levantar el backend
cd src/API
dotnet run
```

**Nombre de migración:** Usá PascalCase descriptivo. Ejemplos:
- `AddTipoProductoYStockInicial`
- `AddConfiguracionTallesJson`
- `AgregarColumnaDescuentoPorVolumen`

---

## Posibles Fallas y Soluciones

### ❌ Error: `Build failed` al intentar generar la migración
**Causa:** El proceso `API.exe` está corriendo y bloquea el `.dll` de salida.  
**Solución:**
```powershell
Stop-Process -Name "API" -ErrorAction SilentlyContinue
# Esperá 2 segundos y reintentá
dotnet ef migrations add ... --project src/Infrastructure --startup-project src/API
```

---

### ❌ Error: `Unable to create a 'DbContext'`
**Causa:** EF no puede instanciar el `ApplicationDbContext` porque no encuentra la cadena de conexión.  
**Solución:** Verificá que `appsettings.Development.json` exista y tenga la `ConnectionStrings.DefaultConnection` correcta:
```powershell
# Verificar que el archivo existe
Test-Path backend/src/API/appsettings.Development.json
```
Si no existe, copiá `appsettings.json` y completá los datos de conexión.

---

### ❌ Error: `42000: column "X" of relation "Y" does not exist` al correr
**Causa:** La base de datos en Neon no tiene aplicada una migración que sí está en el código.  
**Solución:**
```powershell
dotnet ef database update --project src/Infrastructure --startup-project src/API
```

---

### ❌ Error: `42703: column "CreatedAt" does not exist` (en producción Neon)
**Causa:** Neon y local tienen historias de migraciones desfasadas. Esto ocurrió con la tabla `Marcas`.  
**Solución:** Generar una migración que solo agrega la columna faltante:
```powershell
dotnet ef migrations add AddCreatedAtToMarcas --project src/Infrastructure --startup-project src/API
dotnet ef database update --project src/Infrastructure --startup-project src/API
```

---

### ❌ Error: `Address already in use` al correr el backend
**Causa:** El puerto (normalmente 5000/7000) está ocupado por otro proceso.  
**Solución:**
```powershell
# Ver qué proceso usa el puerto 7000
netstat -ano | Select-String ":7000"
# Matar el proceso (reemplazar PID con el número que aparece)
Stop-Process -Id <PID> -Force
```

---

### ❌ Error: `dotnet-ef not found` al intentar correr comandos EF
**Causa:** La tool global de EF no está instalada.  
**Solución:**
```powershell
dotnet tool install --global dotnet-ef
# Si la tenés pero en versión vieja:
dotnet tool update --global dotnet-ef
```

---

### ❌ La migración se generó pero no aparece en la carpeta `/Migrations`
**Causa:** Corriste el comando desde la carpeta equivocada.  
**Solución:** Siempre corré desde `backend/` (la raíz del proyecto .NET), no desde `src/Infrastructure` ni `src/API`:
```powershell
cd Indumentaria-SaaS/backend
dotnet ef migrations add ... --project src/Infrastructure --startup-project src/API
```

---

## Recomendaciones Generales

1. **Nunca edites manualmente** los archivos `.cs` de la carpeta `Migrations/` — son generados automáticamente.
2. **Siempre aplicá `database update`** después de hacer `git pull` si hay migraciones nuevas.
3. **Si necesitás revertir** una migración en desarrollo:
   ```powershell
   dotnet ef database update NombreMigracionAnterior --project src/Infrastructure --startup-project src/API
   dotnet ef migrations remove --project src/Infrastructure --startup-project src/API
   ```
4. **Ambiente de producción (Neon):** Las migraciones se aplican **manualmente** antes de desplegar. Nunca confíes en `dotnet run` para aplicar migraciones en producción automáticamente.
5. **Revisá siempre** el archivo `.Designer.cs` junto al `.cs` de migración — son pares. Si uno está roto, re-generá la migración.

---

## Verificación Rápida Post-Setup

```powershell
# 1. Confirmar que EF está instalado
dotnet ef --version

# 2. Verificar migraciones aplicadas
dotnet ef migrations list --project src/Infrastructure --startup-project src/API

# 3. Build limpio
dotnet build

# 4. Levantar y probar
cd src/API && dotnet run
# → Abrí https://localhost:7000/swagger
```

Si todo funciona → el setup está completo ✅
