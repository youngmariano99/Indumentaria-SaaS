using Application.Common.Interfaces;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Ventas.Queries;

public record VentaDetalleDto
{
    public Guid ProductoId { get; set; }
    public Guid VarianteProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string VarianteNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
}

public record VentaResumenDto
{
    public Guid Id { get; set; }
    public string IdentificadorTicket { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public decimal MontoTotal { get; set; }
    public Guid? ClienteId { get; set; }
    public string? ClienteNombre { get; set; }
    public List<VentaDetalleDto> Detalles { get; set; } = new();
}

public record ObtenerVentaPorIdentificadorQuery(string Identificador) : IRequest<VentaResumenDto?>;

public class ObtenerVentaPorIdentificadorHandler : IRequestHandler<ObtenerVentaPorIdentificadorQuery, VentaResumenDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public ObtenerVentaPorIdentificadorHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<VentaResumenDto?> Handle(ObtenerVentaPorIdentificadorQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;

        var venta = await _context.Ventas
            .Where(v => v.TenantId == tenantId && v.IdentificadorTicket == request.Identificador)
            .Include(v => v.Cliente)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.VarianteProducto)
                    .ThenInclude(vp => vp.Producto)
            .FirstOrDefaultAsync(cancellationToken);

        if (venta == null) return null;

        return new VentaResumenDto
        {
            Id = venta.Id,
            IdentificadorTicket = venta.IdentificadorTicket,
            Fecha = venta.CreatedAt,
            MontoTotal = venta.MontoTotal,
            ClienteId = venta.ClienteId,
            ClienteNombre = venta.Cliente?.Nombre,
            Detalles = venta.Detalles.Select(d => new VentaDetalleDto
            {
                ProductoId = d.VarianteProducto.ProductId,
                VarianteProductoId = d.VarianteProductoId,
                ProductoNombre = d.VarianteProducto.Producto.Nombre,
                VarianteNombre = $"{d.VarianteProducto.Talle} / {d.VarianteProducto.Color}".Trim(' ', '/'),
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitarioAplicado
            }).ToList()
        };
    }
}
