using Application.Common.Interfaces;
using Application.Features.CRM.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Queries;

public class ObtenerClientesQuery : IRequest<List<ClienteDto>>
{
}

public class ObtenerClientesQueryHandler : IRequestHandler<ObtenerClientesQuery, List<ClienteDto>>
{
    private readonly IApplicationDbContext _context;

    public ObtenerClientesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClienteDto>> Handle(ObtenerClientesQuery request, CancellationToken cancellationToken)
    {
        // 1. Traer datos base con conteos y sumas rápidas directas de SQL DB
        var clientesData = await _context.Clientes
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Nombre)
            .Select(c => new
            {
                Cliente = c,
                TotalCompras = _context.Ventas.Count(v => v.ClienteId == c.Id),
                TotalGastado = _context.Ventas.Where(v => v.ClienteId == c.Id).Sum(v => (decimal?)v.MontoTotal) ?? 0
            })
            .ToListAsync(cancellationToken);

        var clienteIds = clientesData.Select(x => x.Cliente.Id).ToList();

        if (clienteIds.Count == 0) return new List<ClienteDto>();

        // 2. Traer todos los detalles de venta de estos clientes para calcular la categoría
        var detallesVentas = await _context.Ventas
            .Where(v => v.ClienteId != null && clienteIds.Contains(v.ClienteId.Value))
            .SelectMany(v => v.Detalles, (v, d) => new { v.ClienteId, d.VarianteProductoId, d.Cantidad })
            .ToListAsync(cancellationToken);

        // 3. Obtener los ProductIds de las variantes
        var varIds = detallesVentas.Select(d => d.VarianteProductoId).Distinct().ToList();
        var variantesMap = await _context.VariantesProducto
            .Where(vp => varIds.Contains(vp.Id))
            .ToDictionaryAsync(vp => vp.Id, vp => vp.ProductId, cancellationToken);
            
        // 4. Obtener los Tipos de Producto
        var productIds = variantesMap.Values.Distinct().ToList();
        var productTypesMap = await _context.Productos
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.TipoProducto, cancellationToken);

        // 5. Agrupar y determinar categoría preferida en memoria (Cero N+1)
        var categoriasPorCliente = detallesVentas
            .Select(d => new 
            {
                d.ClienteId,
                d.Cantidad,
                Categoria = variantesMap.TryGetValue(d.VarianteProductoId, out var pId) && 
                            productTypesMap.TryGetValue(pId, out var tipo) ? tipo.ToString() : "Desconocido"
            })
            .GroupBy(d => d.ClienteId)
            .ToDictionary(
                g => g.Key!.Value,
                g => g.GroupBy(x => x.Categoria)
                      .OrderByDescending(gx => gx.Sum(x => x.Cantidad))
                      .Select(gx => gx.Key)
                      .FirstOrDefault() ?? "Sin compras"
            );

        // 6. Mapear al DTO final
        var result = clientesData.Select(x => new ClienteDto
        {
            Id = x.Cliente.Id,
            Documento = x.Cliente.Documento,
            Nombre = x.Cliente.Nombre,
            Email = x.Cliente.Email,
            Telefono = x.Cliente.Telefono,
            Direccion = x.Cliente.Direccion,
            CondicionIva = x.Cliente.CondicionIva,
            PreferenciasJson = x.Cliente.PreferenciasJson,
            SaldoAFavor = x.Cliente.SaldoAFavor,
            TotalCompras = x.TotalCompras,
            TotalGastado = x.TotalGastado,
            CategoriaPreferida = categoriasPorCliente.TryGetValue(x.Cliente.Id, out var cat) ? cat : "Sin compras"
        }).ToList();

        return result;
    }
}
