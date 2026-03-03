using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using Application.DTOs.Arqueo;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Arqueo.Queries;

public record ObtenerArqueoActualQuery(Guid StoreId) : IRequest<ArqueoDto?>;

public class ObtenerArqueoActualQueryHandler : IRequestHandler<ObtenerArqueoActualQuery, ArqueoDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerArqueoActualQueryHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<ArqueoDto?> Handle(ObtenerArqueoActualQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException();
        var userId = _tenantResolver.UserId ?? throw new UnauthorizedAccessException();

        var arqueo = await _context.ArqueosCaja
            .Include(x => x.Detalles)
                .ThenInclude(d => d.MetodoPago)
            .Where(x => x.TenantId == tenantId && 
                        x.UsuarioId == userId && 
                        x.StoreId == request.StoreId && 
                        x.Estado == EstadoArqueo.Abierto)
            .FirstOrDefaultAsync(cancellationToken);

        if (arqueo == null) return null;

        // Intentar obtener el nombre del usuario si es necesario
        var usuario = await _context.Usuarios.FindAsync(new object[] { arqueo.UsuarioId }, cancellationToken);

        return new ArqueoDto
        {
            Id = arqueo.Id,
            StoreId = arqueo.StoreId,
            StoreNombre = "Sucursal Central", // Placeholder para Guid.Empty
            UsuarioId = arqueo.UsuarioId,
            UsuarioNombre = usuario?.Nombre ?? "Cajero",
            FechaApertura = arqueo.FechaApertura,
            SaldoInicial = arqueo.SaldoInicial,
            Estado = arqueo.Estado.ToString(),
            Detalles = arqueo.Detalles.Select(d => new ArqueoDetalleDto
            {
                MetodoPagoId = d.MetodoPagoId,
                MetodoPagoNombre = d.MetodoPago.Nombre,
                MontoEsperado = d.MontoEsperado,
                MontoReal = d.MontoReal,
                Diferencia = d.Diferencia
            }).ToList()
        };
    }
}
