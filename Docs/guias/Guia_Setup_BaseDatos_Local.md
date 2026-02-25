# Guía de Configuración de Base de Datos Local
#Modulo_Infraestructura #Nivel_Seguridad #Area_Backend

Esta guía te ayudará a levantar el entorno de base de datos PostgreSQL localmente, aplicando las mismas reglas de seguridad y estructura que el servidor de producción.

## Requisitos Previos
1. Tener **PostgreSQL** instalado (versión 14 o superior recomendada).
2. Tener una herramienta de administración (pgAdmin 4, DBeaver, o Datagrip).
3. Tener el **.NET SDK 8/9** instalado.
4. Tener la herramienta CLI de Entity Framework:  
   `dotnet tool install --global dotnet-ef`

## Paso 1: Configurar Credenciales
Asegúrate de que tu archivo `appsettings.Development.json` en `src/API` tenga la cadena de conexión correcta apuntando a tu instancia local:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=Indumentaria_SaaS;Username=postgres;Password=tu_password"
}
```

## Paso 2: Crear la Base de Datos (Método Automático)
Desde la terminal, ubicado en la carpeta `backend` del proyecto, ejecuta:

```bash
dotnet ef database update --project src/Infrastructure/Infrastructure.csproj --startup-project src/API/API.csproj
```

Este comando:
1. Compilará el proyecto.
2. Conectará a tu Postgres local.
3. Creará la base de datos `Indumentaria_SaaS` si no existe.
4. Creará todas las tablas.
5. **Aplicará las Políticas de Seguridad (RLS)** automáticamente.

## Paso 3: Qué hacer si falla la migración (Método Manual)

Si el comando automático falla por permisos o versiones, puedes pedirle a una IA que te genere el script SQL o usar el siguiente Query de emergencia.

### Prompt para IA (Copiar y Pegar)
Si tienes un error extraño, copia el error de la terminal y pégalo en ChatGPT/Claude junto con este texto:

> "Soy desarrollador .NET. Estoy intentando correr 'dotnet ef database update' con PostgreSQL y Npgsql. Tengo configurado Row Level Security (RLS) en mi migración. Me está dando este error: [PEGAR ERROR AQUÍ]. ¿Podrías analizar si es un problema de permisos del usuario postgres, un problema de sintaxis SQL en la migración, o si me falta alguna extensión en la DB?"

### Script SQL Manual de Rescate
Si prefieres hacerlo a mano en **pgAdmin**, abre un "Query Tool" y ejecuta esto para habilitar RLS en una tabla (ejemplo con `Productos`):

```sql
-- 1. Habilitar RLS en la tabla
ALTER TABLE "Productos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Productos" FORCE ROW LEVEL SECURITY;

-- 2. Crear la política de aislamiento
-- Esta política dice: "Solo mostrar filas donde el TenantId coincida con la variable de sesión 'app.current_tenant'"
CREATE POLICY tenant_isolation_policy ON "Productos"
USING ("TenantId" = current_setting('app.current_tenant', true)::uuid);
```

> **Nota**: Para probar esto en pgAdmin manually, primero debes setear la variable de sesión simulando ser un tenant:
> `SET SESSION "app.current_tenant" = 'd2888888-d288-d288-d288-d28888888888';`
> Y luego hacer el `SELECT * FROM "Productos"`.

## Explicación Didáctica del Proceso

Imagina que la Base de Datos es una **Biblioteca Gigante**.

1. **La Migración (`dotnet ef database update`)**:
   - Es como contratar a un equipo de arquitectos y constructores que entran a un terreno vacío y construyen la biblioteca entera en 5 minutos.
   - Ponen los estantes (Tablas), deciden qué libros van dónde (Columnas) y ponen los carteles (Índices).

2. **El Script SQL Hand-made**:
   - Es ir tú mismo con el martillo y los clavos a armar estante por estante. Es válido, pero te puedes olvidar de poner un tornillo y que se caiga todo.
   - Por eso preferimos al equipo de arquitectos (EF Core Migrations), porque siguen el plano (Tu Código C#) al pie de la letra.

3. **Row Level Security (RLS)**:
   - Es ponerle un candado mágico a cada libro.
   - Solo se abre si el lector tiene el carnet de socio correcto (TenantId). Si no, el libro parece estar pegado al estante y no se puede sacar.
