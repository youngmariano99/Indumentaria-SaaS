using Application.Common.Interfaces;
using Application.Features.Reports.DTOs;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Reports.Queries;

public class ObtenerAgingReportQuery : IRequest<List<AgingReportDto>> { }

public class ObtenerAgingReportHandler : IRequestHandler<ObtenerAgingReportQuery, List<AgingReportDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerAgingReportHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<AgingReportDto>> Handle(ObtenerAgingReportQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? System.Guid.Empty;

        // Buscamos clientes con deuda (SaldoAFavor negativo)
        var clientesConDeuda = await _context.Clientes
            .Where(c => c.TenantId == tenantId && c.SaldoAFavor < 0 && !c.IsDeleted)
            .Select(c => new AgingReportDto
            {
                ClienteId = c.Id,
                Nombre = c.Nombre,
                DeudaTotal = Math.Abs(c.SaldoAFavor),
                UltimoMovimiento = _context.MovimientosSaldosClientes
                    .Where(m => m.ClienteId == c.Id)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => (DateTime?)m.CreatedAt)
                    .FirstOrDefault()
            })
            .OrderByDescending(x => x.DeudaTotal)
            .ToListAsync(cancellationToken);

        return clientesConDeuda;
    }
}
