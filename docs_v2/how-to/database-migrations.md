---
title: "Guía de Tareas: Migraciones de Base de Datos"
description: Procedimiento paso a paso para sincronizar y generar cambios en el esquema de PostgreSQL.
status: stable
globs: ["backend/src/Infrastructure/Migrations/**/*"]
---

# Gestión de Migraciones (Entity Framework Core)

Esta guía detalla cómo mantener sincronizada tu base de datos local y cómo registrar nuevos cambios estructurales.

## 🚀 Sincronización Inicial (Setup)

Si acabas de clonar el proyecto o hay cambios de otros desarrolladores:

1.  **Instalar Herramientas**:
    ```powershell
    dotnet tool install --global dotnet-ef
    ```
2.  **Verificar Pendientes**:
    ```powershell
    cd backend
    dotnet ef migrations list --project src/Infrastructure --startup-project src/API
    ```
3.  **Aplicar Cambios**:
    ```powershell
    dotnet ef database update --project src/Infrastructure --startup-project src/API
    ```

---

## 🏗️ Crear una Nueva Migración

Cuando modifiques una Entidad en el proyecto `Core`, sigue estos pasos:

1.  **Detener el Backend**: Asegúrate de que `dotnet run` no esté ejecutándose.
2.  **Generar Migración**:
    ```powershell
    dotnet ef migrations add NombreDescriptivo --project src/Infrastructure --startup-project src/API
    ```
3.  **Impactar en DB**:
    ```powershell
    dotnet ef database update --project src/Infrastructure --startup-project src/API
    ```

---

## 🛠️ Resolución de Problemas Comunes

### Error: `Build failed`
El proceso de la API sigue bloqueando los archivos binarios.
- **Solución**: Ejecuta `Stop-Process -Name "API"` en PowerShell y reintenta.

### Error: `Unable to create a DbContext`
Falta el archivo de configuración con la cadena de conexión.
- **Solución**: Verifica que `backend/src/API/appsettings.Development.json` exista y sea válido.

---
> [!IMPORTANT]
> **Nunca** edites manualmente los archivos de la carpeta `Migrations/`. Si cometiste un error, revierte la migración con `dotnet ef migrations remove` antes de aplicar `database update`.
