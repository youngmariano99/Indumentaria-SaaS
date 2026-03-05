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
                _context.MovimientosSaldosClientes.Add(new MovimientoSaldoCliente
                {
                    TenantId = cliente.TenantId,
                    ClienteId = cliente.Id,
                    Monto = monto,
                    Tipo = TipoMovimientoSaldo.Egreso,
                    Descripcion = "Deuda por prenda en prueba."
                });
                break;

            case EstadoPrendaCliente.Devuelta:
                prenda.Estado = EstadoPrendaCliente.Devuelta;
                var inventario = await _context.Inventarios
                    .FirstOrDefaultAsync(i => i.ProductVariantId == prenda.VarianteProductoId && i.TenantId == cliente.TenantId, cancellationToken);
                if (inventario != null)
                {
                    inventario.StockActual += prenda.Cantidad;
                }
                break;

            default:
                throw new InvalidOperationException("Estado no soportado para esta transición.");
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}

