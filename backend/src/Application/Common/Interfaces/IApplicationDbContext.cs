using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
