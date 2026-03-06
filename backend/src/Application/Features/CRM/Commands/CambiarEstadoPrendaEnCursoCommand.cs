using Application.Common.Interfaces;
using Core.Entities;
using Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public class CambiarEstadoPrendaEnCursoCommand : IRequest
{
    public Guid PrendaId { get; set; }
    public EstadoPrendaCliente NuevoEstado { get; set; }
}

public class CambiarEstadoPrendaEnCursoCommandHandler : IRequestHandler<CambiarEstadoPrendaEnCursoCommand>
{
    private readonly IApplicationDbContext _context;

    public CambiarEstadoPrendaEnCursoCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CambiarEstadoPrendaEnCursoCommand request, CancellationToken cancellationToken)
    {
        var prenda = await _context.PrendasClientesEnCurso
            .Include(p => p.Cliente)
            .FirstOrDefaultAsync(p => p.Id == request.PrendaId, cancellationToken)
            ?? throw new KeyNotFoundException("Registro de prenda en curso no encontrado.");

        if (prenda.Estado != EstadoPrendaCliente.EnPrueba)
        {
            throw new InvalidOperationException("Solo se pueden cambiar prendas que están en estado 'EnPrueba'.");
        }

        var cliente = prenda.Cliente;

        switch (request.NuevoEstado)
        {
            case EstadoPrendaCliente.Pagada:
                prenda.Estado = EstadoPrendaCliente.Pagada;
                break;

            case EstadoPrendaCliente.Deuda:
                prenda.Estado = EstadoPrendaCliente.Deuda;
                var monto = prenda.PrecioReferencia * prenda.Cantidad;
                cliente.SaldoAFavor -= monto;
                var productoNombre = prenda.ProductoManualNombre ?? "Prenda";
                var varianteNombre = prenda.VarianteManualNombre ?? string.Empty;
                if (prenda.VarianteProductoId.HasValue)
                {
                    var variante = await _context.VariantesProducto
                        .AsNoTracking()
                        .FirstOrDefaultAsync(v => v.Id == prenda.VarianteProductoId.Value, cancellationToken);
                    if (variante != null)
                    {
                        var producto = await _context.Productos
                            .AsNoTracking()
                            .FirstOrDefaultAsync(p => p.Id == variante.ProductId, cancellationToken);
                        productoNombre = producto?.Nombre ?? productoNombre;
                        varianteNombre = $"{variante.Talle} / {variante.Color}".Trim(' ', '/');
                    }
                }
                _context.MovimientosSaldosClientes.Add(new MovimientoSaldoCliente
                {
                    TenantId = cliente.TenantId,
                    ClienteId = cliente.Id,
                    Monto = monto,
                    Tipo = TipoMovimientoSaldo.Egreso,
                    Descripcion = $"Deuda por prenda: {productoNombre}"
                        + (string.IsNullOrWhiteSpace(varianteNombre) ? string.Empty : $" ({varianteNombre})")
                        + $" x{prenda.Cantidad}."
                });
                break;

            case EstadoPrendaCliente.Devuelta:
                prenda.Estado = EstadoPrendaCliente.Devuelta;
                if (prenda.VarianteProductoId.HasValue)
                {
                    var inventario = await _context.Inventarios
                        .FirstOrDefaultAsync(i => i.ProductVariantId == prenda.VarianteProductoId.Value && i.TenantId == cliente.TenantId, cancellationToken);
                    if (inventario != null)
                    {
                        inventario.StockActual += prenda.Cantidad;
                    }
                }
                break;

            default:
                throw new InvalidOperationException("Estado no soportado para esta transición.");
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}

