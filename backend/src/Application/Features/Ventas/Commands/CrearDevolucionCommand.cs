using Application.Common.Interfaces;
using Application.DTOs.Ventas;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Commands;

public record CrearDevolucionCommand(DevolucionDto Payload) : IRequest<Guid>;

public class CrearDevolucionCommandHandler : IRequestHandler<CrearDevolucionCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CrearDevolucionCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CrearDevolucionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant inválido o ausente.");
        var cajeroId = _tenantResolver.UserId ?? throw new UnauthorizedAccessException("Usuario cajero inválido o ausente.");

        var p = request.Payload;

        if (p.VariantesDevueltas.Count == 0 && p.VariantesLlevadas.Count == 0)
            throw new Exception("La devolución debe contener al menos un artículo devuelto o un artículo llevado.");

        var cliente = await _context.Clientes.FindAsync(new object[] { p.ClienteId }, cancellationToken);
        if (cliente == null) throw new Exception("Cliente no encontrado.");

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            decimal totalDevueltoALaTienda = 0; // Se traduce en SALDO A FAVOR
            decimal totalLlevadoDeLaTienda = 0; // Se traduce en SALDO EN CONTRA (Paga el cliente)

            // 1. Procesar lo que DEJA el cliente (Le devolvemos plata a su favor y recuperamos stock)
            foreach (var devuelto in p.VariantesDevueltas)
            {
                var varianteDb = await _context.VariantesProducto
                    .FirstOrDefaultAsync(v => v.Id == devuelto.VarianteProductoId, cancellationToken);

                if (varianteDb == null) throw new Exception($"Variante id {devuelto.VarianteProductoId} no existe.");
                
                var prod = await _context.Productos.FindAsync(new object[] { varianteDb.ProductId }, cancellationToken);
                if (prod == null) throw new Exception("Producto de variante no encontrado.");

                var precioUnidad = varianteDb.PrecioOverride ?? prod.PrecioBase;
                totalDevueltoALaTienda += precioUnidad * devuelto.Cantidad;
                
                // Actualizar Stock: INCREMENTO (Vuelve a la tienda)
                var inv = await _context.Inventarios
                    .FirstOrDefaultAsync(i => i.ProductVariantId == varianteDb.Id && i.TenantId == tenantId, cancellationToken);
                
                if (inv != null)
                {
                    inv.StockActual += devuelto.Cantidad;
                }
                else
                {
                    _context.Inventarios.Add(new Inventario
                    {
                        TenantId = tenantId,
                        StoreId = Guid.Empty,
                        ProductVariantId = varianteDb.Id,
                        StockActual = devuelto.Cantidad,
                        StockMinimo = 0
                    });
                }
            }

            // 2. Procesar lo que SE LLEVA el cliente nuevo (Restamos de su favor y perdemos stock)
            foreach (var llevado in p.VariantesLlevadas)
            {
                var varianteDb = await _context.VariantesProducto
                    .FirstOrDefaultAsync(v => v.Id == llevado.VarianteProductoId, cancellationToken);

                if (varianteDb == null) throw new Exception($"Variante id {llevado.VarianteProductoId} no existe.");

                var prod = await _context.Productos.FindAsync(new object[] { varianteDb.ProductId }, cancellationToken);
                if (prod == null) throw new Exception("Producto de variante no encontrado.");

                var precioUnidad = varianteDb.PrecioOverride ?? prod.PrecioBase;
                totalLlevadoDeLaTienda += precioUnidad * llevado.Cantidad;

                // Actualizar Stock: DECREMENTO (Se lo lleva el cliente)
                var inv = await _context.Inventarios
                    .FirstOrDefaultAsync(i => i.ProductVariantId == varianteDb.Id && i.TenantId == tenantId, cancellationToken);
                
                if (inv != null)
                {
                    if (inv.StockActual < llevado.Cantidad)
                    {
                        throw new Exception($"Stock insuficiente para el cambio: '{prod.Nombre} - {varianteDb.Talle} / {varianteDb.Color}'. Disponible: {inv.StockActual}, Requerido: {llevado.Cantidad}");
                    }
                    inv.StockActual -= llevado.Cantidad;
                }
                else
                {
                    throw new Exception($"No se encontró registro de inventario para el cambio: '{prod.Nombre} - {varianteDb.Talle} / {varianteDb.Color}'.");
                }
            }

            // 3. Matemáticas de cruce
            decimal diferenciaNeto = totalDevueltoALaTienda - totalLlevadoDeLaTienda;
            
            // Si la diferencia es positiva, sobra plata. Se la guardamos a favor.
            // Si la diferencia es negativa, quedó debiendo. Se la deducimos llevándole a "Deuda" la wallet.
            cliente.SaldoAFavor += diferenciaNeto;

            if (diferenciaNeto != 0)
            {
                var movimiento = new Core.Entities.MovimientoSaldoCliente
                {
                    TenantId = tenantId,
                    ClienteId = cliente.Id,
                    Monto = Math.Abs(diferenciaNeto),
                    Tipo = diferenciaNeto > 0 ? Core.Entities.TipoMovimientoSaldo.Ingreso : Core.Entities.TipoMovimientoSaldo.Egreso,
                    Descripcion = diferenciaNeto > 0 ? "Saldo a favor por Devolución de producto(s)." : "Deuda por Cambio por producto(s) de mayor valor."
                };
                _context.MovimientosSaldosClientes.Add(movimiento);
            }

            // 4. Todo: Guardar registro documental de la 'DevolucionEntity' para no perderlo.
            // Por el momento nos saltamos el historial detallado para no abrumar el MVP,
            // pero se asegura integridad del Saldo.

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // TODO: Retornar ID de Devolucion en Base
            return Guid.NewGuid();
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
