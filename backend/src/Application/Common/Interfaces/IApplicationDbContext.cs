using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }

    DatabaseFacade Database { get; }

    // Sprint 4: Punto de Venta
    DbSet<Venta> Ventas { get; }
    DbSet<VentaDetalle> VentasDetalles { get; }
    DbSet<MetodoPago> MetodosPago { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
