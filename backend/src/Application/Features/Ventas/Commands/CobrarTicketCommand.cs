using Application.Common.Interfaces;
using Core.Interfaces;
using Application.DTOs.Ventas;
using Core.Entities;
using Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Commands;

public record CobrarTicketCommand(CobrarTicketDto Payload) : IRequest<Guid>;

public class CobrarTicketCommandHandler : IRequestHandler<CobrarTicketCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CobrarTicketCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CobrarTicketCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant inválido o ausente.");
        var cajeroId = _tenantResolver.UserId ?? throw new UnauthorizedAccessException("Usuario cajero inválido o ausente.");

        var payload = request.Payload;

        // Iniciar transacción de base de datos aislada para que todo falle o todo sea exitoso (ACID)
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var venta = new Venta
            {
                TenantId = tenantId,
                UsuarioId = cajeroId,
                MetodoPagoId = payload.MetodoPagoId,
                ClienteId = payload.ClienteId,
                IdentificadorTicket = $"TCK-{DateTime.UtcNow:yyyyMMdd-HHmmss}",
                MontoTotal = 0, // Lo recalculamos para mayor seguridad
                EstadoVenta = EstadoVenta.Cobrada,
                Notas = payload.Notas
            };

            Cliente? clienteDb = null;
            if (payload.ClienteId.HasValue)
            {
                clienteDb = await _context.Clientes.FindAsync(new object[] { payload.ClienteId.Value }, cancellationToken);
            }

            decimal montoRealCalculado = 0;

            foreach (var detalleDto in payload.Detalles)
            {
                // Obtenemos de la base de datos la variante para evitar inyección de precios en el Frontend
                var variante = await _context.VariantesProducto
                    .FirstOrDefaultAsync(v => v.Id == detalleDto.VarianteProductoId, cancellationToken);
                    
                if (variante == null)
                    throw new Exception($"La variante {detalleDto.VarianteProductoId} no existe o no pertenece al catálogo del tenant.");

                // Usamos SIEMPRE el precio de BD, no confiamos en el Front (PrecioBase del producto padre)
                var productoPadre = await _context.Productos.FindAsync(new object[] { variante.ProductId }, cancellationToken);
                var precioReal = productoPadre!.PrecioBase;

                var subtotalReal = precioReal * detalleDto.Cantidad;
                montoRealCalculado += subtotalReal;

                // Cálculo automático de IVA (Asumimos 21% por defecto para indumentaria)
                // Se guarda el desglose para reportes fiscales sin intervención del usuario
                decimal alicuotaIva = 21m;
                decimal baseImponible = subtotalReal / (1 + (alicuotaIva / 100m));
                decimal montoIva = subtotalReal - baseImponible;

                venta.Detalles.Add(new VentaDetalle
                {
                    TenantId = tenantId,
                    VarianteProductoId = variante.Id,
                    Cantidad = detalleDto.Cantidad,
                    PrecioUnitarioAplicado = precioReal,
                    CostoUnitarioAplicado = variante.PrecioCosto, 
                    AlicuotaIvaPct = alicuotaIva,
                    MontoIvaTotal = Math.Round(montoIva, 2),
                    SubtotalLinea = subtotalReal,
                    PosibleDevolucion = detalleDto.PosibleDevolucion
                });

                // 2. Actualizar Stock en el Inventario (Sucursal Global por ahora)
                var inventario = await _context.Inventarios
                    .FirstOrDefaultAsync(i => i.ProductVariantId == variante.Id && i.TenantId == tenantId, cancellationToken);
                
                if (inventario != null)
                {
                    if (inventario.StockActual < detalleDto.Cantidad)
                    {
                        throw new Exception($"Stock insuficiente para '{productoPadre.Nombre} - {variante.Talle} / {variante.Color}'. Disponible: {inventario.StockActual}, Requerido: {detalleDto.Cantidad}");
                    }
                    inventario.StockActual -= detalleDto.Cantidad;
                }
                else
                {
                    // Si no existe el registro de inventario, lanzamos error (no se puede vender algo que no existe en inventario)
                    throw new Exception($"No se encontró registro de inventario para '{productoPadre.Nombre} - {variante.Talle} / {variante.Color}'. No se puede realizar la venta.");
                }
            }

            // 1. Calculamos los extra globales
            decimal subtotalAcumulado = montoRealCalculado;
            decimal descuentoMonto = Math.Round((subtotalAcumulado * payload.DescuentoGlobalPct) / 100m, 2);
            decimal recargoMonto   = Math.Round((subtotalAcumulado * payload.RecargoGlobalPct) / 100m, 2);
            decimal totalParcial = subtotalAcumulado - descuentoMonto + recargoMonto;

            // 1.5 Aplicación Matemática del Saldo (FASE 2)
            if (payload.UsarSaldoCliente && clienteDb != null)
            {
                if (clienteDb.SaldoAFavor > 0)
                {
                    // Cliente tiene dinero a favor: Descontamos hasta agotar la venta
                    // Si la venta es 10k y tiene 3k, le descontamos 3k.
                    // Si la venta es 3k y tiene 10k, la venta queda en 0 y gasta 3k.
                    decimal descuentoAplicable = Math.Min(totalParcial, clienteDb.SaldoAFavor);
                    totalParcial -= descuentoAplicable;
                    clienteDb.SaldoAFavor -= descuentoAplicable;
                    venta.Notas = string.IsNullOrWhiteSpace(venta.Notas) 
                        ? $"Abonó ${descuentoAplicable} con Billetera." 
                        : venta.Notas + $" | Abonó ${descuentoAplicable} con Billetera.";
                    
                    _context.MovimientosSaldosClientes.Add(new MovimientoSaldoCliente
                    {
                        TenantId = tenantId,
                        ClienteId = clienteDb.Id,
                        Monto = descuentoAplicable,
                        Tipo = TipoMovimientoSaldo.Egreso,
                        Descripcion = $"Uso de saldo a favor para abonar Ticket {venta.IdentificadorTicket}",
                        VentaIdAsociada = venta.Id // Referencia para futuras consultas
                    });
                }
                else if (clienteDb.SaldoAFavor < 0)
                {
                    // Cliente TIENE DEUDA (saldo negativo). Se la cobramos ahora sumándola al total.
                    // Ej: debe -2000. totalParcial = 10k. Total a pagar en mostrador = 12k.
                    decimal deudaACobrar = Math.Abs(clienteDb.SaldoAFavor);
                    totalParcial += deudaACobrar;
                    clienteDb.SaldoAFavor = 0; // Si el cajero avanza y paga, liquida la deuda en este ticket.
                    venta.Notas = string.IsNullOrWhiteSpace(venta.Notas) 
                        ? $"Saldó deuda anterior de ${deudaACobrar}." 
                        : venta.Notas + $" | Saldó deuda anterior de ${deudaACobrar}.";

                    _context.MovimientosSaldosClientes.Add(new MovimientoSaldoCliente
                    {
                        TenantId = tenantId,
                        ClienteId = clienteDb.Id,
                        Monto = deudaACobrar,
                        Tipo = TipoMovimientoSaldo.Ingreso, // Ingresa la plata para cancelar la deuda vieja
                        Descripcion = $"Cancelación de deuda previa en Ticket {venta.IdentificadorTicket}",
                        VentaIdAsociada = venta.Id
                    });
                }
            }

            // 2. Validar si el Front End mentía severamente sobre el Monto Total
            if (Math.Abs(totalParcial - payload.MontoTotalDeclarado) > 1m) 
            {
                 throw new Exception("El monto enviado difiere con el cálculo en el servidor (Subtotales + Descuentos/Recargos + Billetera).");
            }

            venta.Subtotal = subtotalAcumulado;
            venta.DescuentoGlobalPct = payload.DescuentoGlobalPct;
            venta.DescuentoMonto = descuentoMonto;
            venta.RecargoGlobalPct = payload.RecargoGlobalPct;
            venta.RecargoMonto = recargoMonto;
            venta.MontoTotal = totalParcial;

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return venta.Id;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw; // Propagar excepción al ExceptionHandlingMiddleware
        }
    }
}
