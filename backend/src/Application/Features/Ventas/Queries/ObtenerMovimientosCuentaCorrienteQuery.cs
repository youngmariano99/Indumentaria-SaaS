using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Queries;

public record MovimientoCuentaCorrienteDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? MetodoPago { get; set; }
}

public record ObtenerMovimientosCuentaCorrienteQuery(Guid ClienteId) : IRequest<List<MovimientoCuentaCorrienteDto>>;

public class ObtenerMovimientosCuentaCorrienteHandler : IRequestHandler<ObtenerMovimientosCuentaCorrienteQuery, List<MovimientoCuentaCorrienteDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerMovimientosCuentaCorrienteHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<MovimientoCuentaCorrienteDto>> Handle(ObtenerMovimientosCuentaCorrienteQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;

        var movimientos = await _context.MovimientosSaldosClientes
            .Where(m => m.TenantId == tenantId && m.ClienteId == request.ClienteId)
            .Include(m => m.MetodoPago)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MovimientoCuentaCorrienteDto
            {
                Id = m.Id,
                Fecha = m.CreatedAt,
                Monto = m.Monto,
                Tipo = m.Tipo.ToString(),
                Descripcion = m.Descripcion,
                MetodoPago = m.MetodoPago != null ? m.MetodoPago.Nombre : null
            })
            .ToListAsync(cancellationToken);

        return movimientos;
    }
}
