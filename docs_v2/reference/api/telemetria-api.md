---
title: "Referencia de API: Telemetría PWA (Offline Sync)"
description: Monitoreo de estado de dispositivos, versión de app y sincronización de items pendientes.
status: experimental
globs: ["backend/src/API/Controllers/TelemetriaController.cs", "Core/Entities/EstadoDispositivoPwa.cs"]
---

# Telemetría y Monitoreo de Dispositivos (PWA)

Este módulo permite al equipo técnico monitorear la salud de las instalaciones PWA en cada sucursal y detectar problemas de sincronización de datos.

## 📡 Endpoints

### 1. PWA Ping (Heartbeat)
Registra la presencia de un dispositivo, su versión de la aplicación y la cantidad de cambios que tiene pendientes de subir al servidor (Items en cola offline).

- **URL:** `POST /api/telemetria/pwa-ping`
- **Auth:** Requerido (Bearer JWT)
- **Body (`PwaPingRequest`)**:
```typescript
interface PwaPingRequest {
  dispositivoId: string;       // UUID persistente en LocalStorage
  nombreDispositivo: string;   // Ej: "Tablet Salon 1"
  appVersion: string;         // Ej: "1.0.42"
  itemsPendientesSubida: number; // Indica si hay items en la DB local
}
```
- **Respuesta**: Última hora de ping registrada.

---

## 🏛️ Propósito de Monitoreo
La telemetría permite detectar proactivamente:
1. **Desactualización**: Dispositivos corriendo versiones viejas de la app que podrían causar errores de esquema.
2. **Atasco Sincronización**: Sucursales que tienen muchos items en cola por falta de internet prolongada, lo cual afecta la visibilidad del stock real para el dueño.
