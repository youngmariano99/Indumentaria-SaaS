using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Inquilino> Inquilinos { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }
    DbSet<Inventario> Inventarios { get; }

    DatabaseFacade Database { get; }

    DbSet<Cliente> Clientes { get; }

    // Sprint 4: Punto de Venta
    DbSet<Venta> Ventas { get; }
    DbSet<VentaDetalle> VentasDetalles { get; }
    DbSet<MetodoPago> MetodosPago { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
