---
title: "Guía de Tareas: Poblar Base de Datos Local"
description: Procedimiento para cargar datos de prueba masivos (Big Data) e inicializar la demo.
status: stable
globs: ["docs/datosPrueba/**/*"]
---

# Sembrado de Datos (Seed Database)

Esta guía te permite cargar un entorno completo con miles de productos, categorías reales y un historial de ventas para probar el SaaS.

## 🚀 Paso 1: Obtener el Script SQL
Dirígete a la carpeta `docs/datosPrueba/` y localiza el archivo correspondiente al rubro que deseas sembrar:
-   **Ferretería**: `prmpPruebaFunciona.md` (Ver bloque SQL interno).
-   **Indumentaria**: `indumentaria-seed.sql` (Ejecución directa).

## 🛠️ Paso 2: Ejecución del Script
Cualquier gestor de PostgreSQL (DBeaver, pgAdmin, Azure Data Studio) te servirá:

1.  Abre una **consola SQL** conectada a tu base de datos local (DefaultConnection).
2.  Copia todo el contenido del archivo `.md` (omitiendo los bloques de texto explicativo).
3.  **Ejecuta el bloque SQL completo**.

---

## 📊 Datos de Demo (Credenciales)
Una vez ejecutado el script, las credenciales de acceso para la demo son:
-   **Email**: `demo@ferreteria.com` (o el email configurado en el script).
-   **Password**: `123456789`
-   **Subdominio**: `ferre-demo` (o el subdominio configurado).

---
> [!NOTE]
> **Limpieza Automática**: El script está diseñado para limpiar (`DELETE`) todos los datos relacionados al Inquilino (TenantID) antes de cargar los nuevos, lo que permite "resetear" la demo infinitas veces de forma limpia.
