using Application.Common.Interfaces;
using Application.DTOs.Arqueo;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Arqueo.Queries;

public record ObtenerHistorialArqueosQuery(Guid StoreId, int PageNumber = 1, int PageSize = 10) : IRequest<List<ArqueoDto>>;

public class ObtenerHistorialArqueosQueryHandler : IRequestHandler<ObtenerHistorialArqueosQuery, List<ArqueoDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerHistorialArqueosQueryHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<List<ArqueoDto>> Handle(ObtenerHistorialArqueosQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException();

        var query = _context.ArqueosCaja
            .Include(a => a.Detalles)
                .ThenInclude(d => d.MetodoPago)
            .Where(a => a.TenantId == tenantId && 
                        a.StoreId == request.StoreId && 
                        a.Estado != EstadoArqueo.Abierto)
            .OrderByDescending(a => a.FechaCierre);

        // Paginación básica
        var arqueos = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Obtener nombres de usuarios
        var userIds = arqueos.Select(a => a.UsuarioId).Distinct().ToList();
        var usuarios = await _context.Usuarios
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Nombre, cancellationToken);

        return arqueos.Select(a => new ArqueoDto
        {
            Id = a.Id,
            StoreId = a.StoreId,
            StoreNombre = "Sucursal Principal", // TODO: Obtener de base datos real si hubiera multiples sucursales
            UsuarioId = a.UsuarioId,
            UsuarioNombre = usuarios.GetValueOrDefault(a.UsuarioId, "Cajero Desconocido"),
            FechaApertura = a.FechaApertura,
            FechaCierre = a.FechaCierre,
            SaldoInicial = a.SaldoInicial,
            TotalVentasEsperado = a.TotalVentasEsperado,
            TotalManualEsperado = a.TotalManualEsperado,
            TotalRealContado = a.TotalRealContado,
            Diferencia = a.Diferencia,
            Estado = a.Estado.ToString(),
            Observaciones = a.Observaciones,
            Detalles = a.Detalles.Select(d => new ArqueoDetalleDto
            {
                MetodoPagoId = d.MetodoPagoId,
                MetodoPagoNombre = d.MetodoPago?.Nombre ?? "Desconocido",
                MontoEsperado = d.MontoEsperado,
                MontoReal = d.MontoReal,
                Diferencia = d.Diferencia
            }).ToList()
        }).ToList();
    }
}
