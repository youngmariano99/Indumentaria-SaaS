using Application.Common.Interfaces;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public record CrearPrendaEnCursoCommand(
    Guid ClienteId,
    Guid? VarianteProductoId,
    string? ProductoManualNombre,
    string? VarianteManualNombre,
    int Cantidad,
    decimal PrecioReferencia,
    EstadoPrendaCliente EstadoInicial
) : IRequest<Guid>;

public class CrearPrendaEnCursoCommandHandler : IRequestHandler<CrearPrendaEnCursoCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CrearPrendaEnCursoCommandHandler(IApplicationDbContext context, ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<Guid> Handle(CrearPrendaEnCursoCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId ?? throw new UnauthorizedAccessException("Tenant inválido o ausente.");
        if (request.Cantidad <= 0)
            throw new ArgumentException("La cantidad debe ser mayor a cero.");
        if (request.PrecioReferencia < 0)
            throw new ArgumentException("El precio de referencia no puede ser negativo.");
        if (request.EstadoInicial is EstadoPrendaCliente.Pagada or EstadoPrendaCliente.Devuelta)
            throw new InvalidOperationException("Solo se permite crear la prenda en estado 'EnPrueba' o 'Deuda'.");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.ClienteId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Cliente no encontrado.");

        string productoNombre;
        string varianteNombre;
        Guid? varianteId = null;

        if (request.VarianteProductoId.HasValue)
        {
            var variante = await _context.VariantesProducto
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == request.VarianteProductoId.Value, cancellationToken)
                ?? throw new KeyNotFoundException("Variante de producto no encontrada.");

            var inventario = await _context.Inventarios
                .FirstOrDefaultAsync(i => i.ProductVariantId == variante.Id && i.TenantId == tenantId, cancellationToken)
                ?? throw new Exception("No se encontró registro de inventario para la variante seleccionada.");

            if (inventario.StockActual < request.Cantidad)
            {
                throw new Exception($"Stock insuficiente para la prenda en prueba. Disponible: {inventario.StockActual}");
            }

            inventario.StockActual -= request.Cantidad;
            varianteId = variante.Id;

            var producto = await _context.Productos
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == variante.ProductId, cancellationToken);

            productoNombre = producto?.Nombre ?? "Producto";
            varianteNombre = $"{variante.Talle} / {variante.Color}".Trim(' ', '/');
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.ProductoManualNombre))
                throw new ArgumentException("Debe indicar un nombre de producto manual cuando no selecciona una variante.");

            productoNombre = request.ProductoManualNombre.Trim();
            varianteNombre = (request.VarianteManualNombre ?? string.Empty).Trim();
        }

        var descripcionDeuda = $"Deuda por prenda: {productoNombre}"
            + (string.IsNullOrWhiteSpace(varianteNombre) ? string.Empty : $" ({varianteNombre})")
            + $" x{request.Cantidad}.";

        var entity = new ClientePrendaEnCurso
        {
            TenantId = tenantId,
            ClienteId = cliente.Id,
            VarianteProductoId = varianteId,
            ProductoManualNombre = varianteId.HasValue ? null : productoNombre,
            VarianteManualNombre = varianteId.HasValue ? null : (string.IsNullOrWhiteSpace(varianteNombre) ? null : varianteNombre),
            Cantidad = request.Cantidad,
            PrecioReferencia = request.PrecioReferencia,
            Estado = request.EstadoInicial
        };

        _context.PrendasClientesEnCurso.Add(entity);

        if (request.EstadoInicial == EstadoPrendaCliente.Deuda)
        {
            var monto = request.PrecioReferencia * request.Cantidad;
            cliente.SaldoAFavor -= monto;
            _context.MovimientosSaldosClientes.Add(new MovimientoSaldoCliente
            {
                TenantId = tenantId,
                ClienteId = cliente.Id,
                Monto = monto,
                Tipo = TipoMovimientoSaldo.Egreso,
                Descripcion = descripcionDeuda
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

