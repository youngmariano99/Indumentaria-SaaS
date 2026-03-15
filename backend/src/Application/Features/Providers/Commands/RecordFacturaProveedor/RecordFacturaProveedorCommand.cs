using Application.Common.Interfaces;
using Core.Entities;
using Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Providers.Commands.RecordFacturaProveedor;

public class RecordFacturaProveedorCommand : IRequest<Guid>
{
    public Guid ProveedorId { get; set; }
    public string NumeroFactura { get; set; } = null!;
    public DateTime FechaEmision { get; set; }
    public DateTime FechaVencimiento { get; set; }
    public List<FacturaLineaDto> Lineas { get; set; } = new();
}

public class FacturaLineaDto
{
    public string Descripcion { get; set; } = null!;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public Guid? VarianteId { get; set; }
}

public class RecordFacturaProveedorCommandHandler : IRequestHandler<RecordFacturaProveedorCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public RecordFacturaProveedorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(RecordFacturaProveedorCommand request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProveedorId, cancellationToken);

        var markupFactor = 1 + ((proveedor?.PorcentajeRecargo ?? 0) / 100);
        var montoTotal = request.Lineas.Sum(l => l.Cantidad * l.PrecioUnitario);

        var factura = new FacturaProveedor
        {
            Id = Guid.NewGuid(),
            ProveedorId = request.ProveedorId,
            NumeroFactura = request.NumeroFactura,
            FechaEmision = request.FechaEmision,
            FechaVencimiento = request.FechaVencimiento,
            MontoTotal = montoTotal,
            SaldoPendiente = montoTotal, // El trigger se encarga de esto si hay lógica, pero lo seteamos inicial
            Origen = OrigenFactura.Manual,
            EstadoProcesamiento = EstadoProcesamientoFactura.Confirmado
        };

        _context.FacturasProveedores.Add(factura);

        // Procesar líneas para actualizar stock y costos
        foreach (var linea in request.Lineas)
        {
            if (linea.VarianteId.HasValue)
            {
                // 1. Actualizar Costo en la Variante
                var variante = await _context.VariantesProducto
                    .FirstOrDefaultAsync(v => v.Id == linea.VarianteId.Value, cancellationToken);
                
                if (variante != null)
                {
                    variante.PrecioCosto = linea.PrecioUnitario * markupFactor;
                }

                // 2. Incrementar Stock en Inventario
                // Buscamos el inventario de la variante para la sucursal principal (la primera encontrada por ahora)
                var inventario = await _context.Inventarios
                    .FirstOrDefaultAsync(i => i.ProductVariantId == linea.VarianteId.Value, cancellationToken);

                if (inventario != null)
                {
                    inventario.StockActual += linea.Cantidad;
                }
                else
                {
                    // Obtener la sucursal principal del tenant
                    var sucursalId = await _context.Sucursales
                        .Select(s => s.Id)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (sucursalId != Guid.Empty)
                    {
                        _context.Inventarios.Add(new Inventario
                        {
                            Id = Guid.NewGuid(),
                            ProductVariantId = linea.VarianteId.Value,
                            StockActual = linea.Cantidad,
                            StockMinimo = 5,
                            StoreId = sucursalId
                        });
                    }
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return factura.Id;
    }
}
