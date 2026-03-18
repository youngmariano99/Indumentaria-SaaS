---
title: "Estrategia de Testing: Malla de Seguridad"
description: Definición de la cobertura de tests, infraestructura de pruebas y procedimientos de automatización.
status: stable
globs: ["backend/src/API.IntegrationTests/**/*"]
---

# Estrategia de Testing (Verdad Técnica)

Indumentaria-SaaS utiliza una estrategia de **Integration Testing** para blindar la lógica de negocio y las integraciones críticas con la base de datos y servicios externos.

## 🏗️ Infraestructura de Pruebas

- **Framework**: xUnit.
- **Factoría**: `WebApplicationFactory` (simula la API completa en memoria).
- **Base de Datos**: `EF Core InMemoryDatabase` (efímera, destruida al finalizar el test).
- **Assertions**: `FluentAssertions` para una sintaxis legible y natural.

---

## 🛡️ Cobertura de Tests (Módulos Críticos)

### 🔐 Autenticación
- **Denegación de Acceso**: Validación de credenciales erróneas o expiradas (`401 Unauthorized`).
- **Validez de Entrada**: Rechazo de formularios malformados mediante `FluentValidation` sin tocar la base de datos (`400 Bad Request`).

### 📦 Catálogo y Productos
- **Salud Comercial**: Validación de que el `PrecioBase` sea estrictamente mayor a 0.
- **Acceso Autorizado**: Verificación de que solo usuarios autenticados puedan modificar la matriz de productos.

### 🛒 Punto de Venta (POS)
- **Integridad Financiera**: Validación de tickets con montos negativos, ítems vacíos o métodos de pago inexistentes.
- **Idempotencia (Planificado)**: Verificación de que reintentos de cobro idénticos no generen duplicación de ventas.

---

## 📈 Procedimiento de Expansión
Al agregar nuevas funcionalidades (ej. Facturación Fiscal, Wallet), es **obligatorio**:
1. Crear el archivo de test en la carpeta correspondiente.
2. Implementar al menos un test de "Punto de Falla" (Negative Test) y un "Punto de Éxito" (Positive Test).
3. Actualizar este documento si se introduce un nuevo patrón de testeo.

---
> [!TIP]
> **Comando rápido**: Ejecuta `dotnet test` desde la raíz para correr toda la suite en microsegundos.
