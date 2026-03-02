# Bitácora Backend: Historial de Saldos Unificado (CRM Cliente 360)

**Fecha y Hora**: 2026-03-02 18:45
**Tipo de Cambio**: Nueva Función / Refactor
**Tags**: #Modulo_CRM, #Importancia_Media, #Area_Backend, #Nivel_Base

## Impacto en Multi-tenancy
La nueva tabla `MovimientoSaldoCliente` implementa la interfaz `IMustHaveTenant` y está protegida por el Interceptor Global de Entity Framework Core. Al crear o consultar Movimientos de Saldo, se filtra automáticamente usando el `TenantId` del usuario en sesión (cajero) asegurando que no haya fuga de saldos entre franquicias o sucursales distintas.

## Detalle Técnico
- **Base de Datos**: Se implementó la nueva entidad `MovimientoSaldoCliente` en PostgreSQL y se corrió la respectiva migración en el schema de Neon. Contiene campos clave para Auditoría (`Monto`, `Tipo [Ingreso/Egreso]`, `Descripcion`, `CreatedAt`, `TenantId`).
- **CQRS Commands**: Los comandos `AgregarSaldoClienteCommand`, `DescontarSaldoClienteCommand`, `CrearDevolucionCommand` y `CobrarTicketCommand` fueron expandidos. Ahora no solo suman o restan flat el `SaldoAFavor` de la tabla `Cliente`, sino que insertan un registro `MovimientoSaldoCliente` por la diferencia.
- **Seguridad y Bugs Atendidos**: Se solucionó un defecto del diseño por defecto del Framework donde los nuevos `MovimientoSaldoCliente` se guardaban con `TenantId = Guid.Empty`. Para solucionarlo temporalmente, se inyectó el `ITenantResolver` en el constructor de los Comandos y se asignó manualmente en el initializer del objeto.
- **DTOs y Queries**: Se alteró drásticamente el modelo que consume la API. `ObtenerCliente360Query` ya no devuelve únicamente tickets, sino que devuelve una colección unificada cronológicamente (`HistorialTransacciones`) que combina `Ventas` y `MovimientosSaldosClientes`, ordenada por `.CreatedAt` en reversa.

---

## Explicación Didáctica

Imaginemos que la Billetera del Cliente antes era una simple "pizarra magnética" donde el cajero borraba "100" y escribía "120". No quedaba ningún registro de **quién**, **por qué** o **cuándo** le dieron esos 20 pesos de más.

1. **La Tabla Histórica (`MovimientoSaldoCliente`)**: Ahora en vez de una pizarra, tenemos un "Libro Contable" oficial. Cada vez que el saldo sube o baja, obligamos al cajero a tomar una hoja nueva del libro y anotar la fecha, el monto, y escribir el por qué (Ejemplo: "Se descontó saldo por una compra" o "Ajuste manual a favor por una devolución"). 
2. **El Unificador (`ObtenerCliente360Query`)**: Cuando el cliente llega al mostrador y el cajero abre su perfil, en lugar de mostrarle dos libros separados (uno de ventas de tickets regulares y otro de dinero favor), el servidor agarra ambos cajones, extrae todas las hojas y las ordena por fecha de manera intercalada. Así, el cajero ve exactamente "Ayer compró, hoy le ingresamos plata, hace 1 minuto devolvió".
