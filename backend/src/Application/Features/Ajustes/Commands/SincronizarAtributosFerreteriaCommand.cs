using Application.Common.Interfaces;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ajustes.Commands;

public class SincronizarAtributosFerreteriaCommand : IRequest<bool>
{
}

public class SincronizarAtributosFerreteriaCommandHandler : IRequestHandler<SincronizarAtributosFerreteriaCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public SincronizarAtributosFerreteriaCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<bool> Handle(SincronizarAtributosFerreteriaCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new Exception("No hay tenant activo para sincronizar atributos.");

        var atributosExistentes = await _context.AtributosConfiguracion
            .Where(a => a.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        if (atributosExistentes.Any())
            return true; // Ya existen atributos, no sobreescribimos.

        var atributosSemilla = new List<AtributoConfiguracion>();

        // ── Medidas ──
        string[] medidas = { "1/4\"", "3/8\"", "1/2\"", "3/4\"", "1\"", "1 1/4\"", "1 1/2\"", "2\"", "13 mm", "19 mm", "50 mm" };
        for (int i = 0; i < medidas.Length; i++)
        {
            atributosSemilla.Add(new AtributoConfiguracion { TenantId = tenantId, Grupo = "Medida", Valor = medidas[i], Orden = i });
        }

        // ── Materiales ──
        string[] materiales = { "Acero Carbono", "Acero Inoxidable", "Bronce", "Zincado", "Aluminio", "PVC", "Polipropileno" };
        for (int i = 0; i < materiales.Length; i++)
        {
            atributosSemilla.Add(new AtributoConfiguracion { TenantId = tenantId, Grupo = "Material", Valor = materiales[i], Orden = i });
        }

        // ── Presentaciones ──
        string[] presentaciones = { "Unidad", "Fracción", "Blister", "Caja x50", "Caja x100", "Bolsa x1kg", "Rollo x100m" };
        for (int i = 0; i < presentaciones.Length; i++)
        {
            atributosSemilla.Add(new AtributoConfiguracion { TenantId = tenantId, Grupo = "Presentacion", Valor = presentaciones[i], Orden = i });
        }

        _context.AtributosConfiguracion.AddRange(atributosSemilla);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
