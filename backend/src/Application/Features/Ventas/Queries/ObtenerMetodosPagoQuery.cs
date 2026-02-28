using Application.Common.Interfaces;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Queries;

public record MetodoPagoDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
}

public record ObtenerMetodosPagoQuery() : IRequest<List<MetodoPagoDto>>;

public class ObtenerMetodosPagoQueryHandler : IRequestHandler<ObtenerMetodosPagoQuery, List<MetodoPagoDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerMetodosPagoQueryHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<MetodoPagoDto>> Handle(ObtenerMetodosPagoQuery request, CancellationToken cancellationToken)
    {
        var query = _context.MetodosPago
            .Where(m => m.Activo)
            .OrderBy(m => m.Nombre);

        var hasMetodos = await query.AnyAsync(cancellationToken);

        // Seeder automático para que el usuario pueda probar el POS de inmediato
        if (!hasMetodos)
        {
            var tenantId = _tenantResolver.TenantId;
            if (tenantId != null && tenantId != Guid.Empty)
            {
                var seedData = new List<Core.Entities.MetodoPago>
                {
                    new Core.Entities.MetodoPago { TenantId = tenantId.Value, Nombre = "Efectivo", Descripcion = "Efectivo en caja", Activo = true },
                    new Core.Entities.MetodoPago { TenantId = tenantId.Value, Nombre = "Tarjeta de Crédito", Descripcion = "Posnet", Activo = true },
                    new Core.Entities.MetodoPago { TenantId = tenantId.Value, Nombre = "Tarjeta de Débito", Descripcion = "Posnet", Activo = true },
                    new Core.Entities.MetodoPago { TenantId = tenantId.Value, Nombre = "Transferencia", Descripcion = "CBU / CVU / Billeteras", Activo = true }
                };

                await _context.MetodosPago.AddRangeAsync(seedData, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        return await query.Select(m => new MetodoPagoDto
        {
            Id = m.Id,
            Nombre = m.Nombre,
            Descripcion = m.Descripcion
        }).ToListAsync(cancellationToken);
    }
}
