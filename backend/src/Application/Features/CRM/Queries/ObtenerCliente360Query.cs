using Application.Common.Interfaces;
using Application.Features.CRM.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Features.CRM.Queries;

public class ObtenerCliente360Query : IRequest<Cliente360Dto>
{
    public Guid ClienteId { get; set; }
}

public class ObtenerCliente360QueryHandler : IRequestHandler<ObtenerCliente360Query, Cliente360Dto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ObtenerCliente360QueryHandler> _logger;

    public ObtenerCliente360QueryHandler(IApplicationDbContext context, ILogger<ObtenerCliente360QueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Cliente360Dto> Handle(ObtenerCliente360Query request, CancellationToken cancellationToken)
    {
        try 
        {
        var cliente = await _context.Clientes
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.ClienteId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"No se encontró el cliente con ID {request.ClienteId}");

        // Obtener Ventas de este Cliente
        var ventas = await _context.Ventas
            .AsNoTracking()
            .Where(v => v.ClienteId == request.ClienteId)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.VarianteProducto)
            .OrderByDescending(v => v.CreatedAt) // Asumiendo BaseEntity o similar
            .ToListAsync(cancellationToken);

        var productIds = ventas.SelectMany(v => v.Detalles).Select(d => d.VarianteProducto.ProductId).Distinct().ToList();
        var productosDict = await _context.Productos
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Nombre, cancellationToken);

        var totalGastado = ventas.Sum(v => v.MontoTotal);
        var cantidadCompras = ventas.Count;
        var ticketPromedio = cantidadCompras > 0 ? totalGastado / cantidadCompras : 0;
        var ultimaCompra = ventas.FirstOrDefault()?.CreatedAt;

        // Optimizamos para no traer miles, traemos tope 100 de cada o todas si son pocas, el Front end paginará.
        var movimientos = await _context.MovimientosSaldosClientes
            .AsNoTracking()
            .Where(m => m.ClienteId == request.ClienteId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        var historialUnificado = new List<TransaccionHistoricoDto>();

        // Mapear Ventas
        historialUnificado.AddRange(ventas.Select(v => new TransaccionHistoricoDto
        {
            Id = v.Id,
            Fecha = v.CreatedAt,
            Tipo = "Venta",
            MontoTotal = v.MontoTotal,
            Descripcion = v.IdentificadorTicket,
            Detalles = v.Detalles.Select(d => new CompraRecienteDetalleDto 
            {
                VarianteProductoId = d.VarianteProductoId,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitarioAplicado,
                PosibleDevolucion = d.PosibleDevolucion,
                VarianteNombre = $"{d.VarianteProducto.Talle} / {d.VarianteProducto.Color}".Trim(' ', '/'),
                ProductoNombre = productosDict.TryGetValue(d.VarianteProducto.ProductId, out var n) ? n : "Producto Borrado"
            }).ToList()
        }));

        // Mapear Movimientos de Billetera
        historialUnificado.AddRange(movimientos.Select(m => new TransaccionHistoricoDto
        {
            Id = m.Id,
            Fecha = m.CreatedAt,
            Tipo = m.Tipo == Core.Entities.TipoMovimientoSaldo.Ingreso ? "Ingreso de Saldo" : "Egreso de Saldo",
            MontoTotal = m.Monto,
            Descripcion = m.Descripcion,
            Detalles = null,
            DeudaOrigenId = m.DeudaOrigenId
        }));

        historialUnificado = historialUnificado.OrderByDescending(x => x.Fecha).ToList();

        // Prendas en curso del cliente
        var prendasEnCurso = await _context.PrendasClientesEnCurso
            .AsNoTracking()
            .Where(p => p.ClienteId == request.ClienteId)
            .Include(p => p.VarianteProducto)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var productIdsPrendas = prendasEnCurso
            .Select(p => p.VarianteProducto.ProductId)
            .Distinct()
            .ToList();

        var productosDictPrendas = await _context.Productos
            .AsNoTracking()
            .Where(p => productIdsPrendas.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Nombre, cancellationToken);

        var prendasEnCursoDto = prendasEnCurso.Select(p => new PrendaEnCursoDto
        {
            Id = p.Id,
            VarianteProductoId = p.VarianteProductoId,
            ProductoNombre = productosDictPrendas.TryGetValue(p.VarianteProducto.ProductId, out var n) ? n : "Producto Borrado",
            VarianteNombre = $"{p.VarianteProducto.Talle} / {p.VarianteProducto.Color}".Trim(' ', '/'),
            Cantidad = p.Cantidad,
            PrecioReferencia = p.PrecioReferencia,
            Estado = p.Estado.ToString(),
            Fecha = p.CreatedAt
        }).ToList();

        return new Cliente360Dto
        {
            Id = cliente.Id,
            Documento = cliente.Documento,
            Nombre = cliente.Nombre,
            Email = cliente.Email,
            Telefono = cliente.Telefono,
            Direccion = cliente.Direccion,
            CondicionIva = cliente.CondicionIva,
            PreferenciasJson = cliente.PreferenciasJson,
            SaldoAFavor = cliente.SaldoAFavor,

            // Métricas y Cruce de datos
            TotalGastadoHistorico = totalGastado,
            CantidadComprasHistoricas = cantidadCompras,
            TicketPromedio = ticketPromedio,
            FechaUltimaCompra = ultimaCompra,
            HistorialTransacciones = historialUnificado,
            PrendasEnCurso = prendasEnCursoDto
        };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "==== GRAVE ERROR AL CARGAR EL PERFIL 360 DEL CLIENTE {Id} ====", request.ClienteId);
            throw;
        }
    }
}
