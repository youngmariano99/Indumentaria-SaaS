---
title: "ADR-001: Elección de PostgreSQL como Motor de Base de Datos"
status: "aceptado"
date: 2026-03-17
deciders: "Arquitecto Senior, Equipo de Desarrollo"
---

# ADR-001: Elección de PostgreSQL como Motor de Base de Datos

## Contexto y Problema
El sistema ERP SaaS requiere una base de datos robusta, capaz de manejar múltiples inquilinos (Multi-Tenancy) con aislamiento estricto de datos y alto rendimiento en consultas complejas (JSONB). Necesitábamos una solución que permitiera escalabilidad sin comprometer la integridad ACID de las transacciones financieras.

## Decisión
Hemos elegido **PostgreSQL (v16+)** como el motor de base de datos relacional principal. La decisión se basa primordialmente en su soporte nativo para **Row-Level Security (RLS)** y su excelente manejo de tipos de datos **JSONB** para metadatos dinámicos.

## Opciones Consideradas
1. **SQL Server**: Excelente integración con .NET, pero costos de licenciamiento elevados para un modelo SaaS escalable y mayor complejidad para implementar RLS dinámico comparado con Postgres.
2. **MongoDB**: Ágil para esquemas dinámicos, pero carece de transacciones robustas multisentencia necesarias para un ERP y no ofrece un modelo de aislamiento nativo tan sólido como RLS.
3. **PostgreSQL**: Open source, estándar de industria, con RLS nativo y soporte JSONB de alto rendimiento.

## Consecuencias
### ✅ Positivas
- **Aislamiento Nativo**: El uso de RLS reduce el riesgo de filtración de datos entre Tenants al delegar el filtrado al motor de BD.
- **Flexibilidad**: JSONB permite implementar el motor Multi-Rubro (atributos dinámicos) con índices GIN de alta velocidad.
- **Cero Costos de Licencia**: Al ser Open Source, permite escalar la infraestructura horizontalmente sin penalizaciones económicas por núcleo/instancia.

### ⚠️ Negativas / Riesgos
- **Curva de Aprendizaje**: Configurar políticas RLS y triggers de auditoría requiere conocimientos específicos de administración de Postgres.
- **Mantenimiento**: La gestión de índices GIN sobre JSONB requiere monitoreo periódico para evitar degradación de performance en tablas masivas.

## Estado
Aceptado
