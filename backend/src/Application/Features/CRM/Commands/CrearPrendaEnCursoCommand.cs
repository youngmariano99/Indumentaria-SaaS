using Application.Common.Interfaces;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public record CrearPrendaEnCursoCommand(
    Guid ClienteId,
    Guid VarianteProductoId,
    int Cantidad,
    decimal PrecioReferencia
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

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.ClienteId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Cliente no encontrado.");

        var variante = await _context.VariantesProducto
            .FirstOrDefaultAsync(v => v.Id == request.VarianteProductoId, cancellationToken)
            ?? throw new KeyNotFoundException("Variante de producto no encontrada.");

        var inventario = await _context.Inventarios
            .FirstOrDefaultAsync(i => i.ProductVariantId == variante.Id && i.TenantId == tenantId, cancellationToken)
            ?? throw new Exception("No se encontró registro de inventario para la variante seleccionada.");

        if (inventario.StockActual < request.Cantidad)
        {
            throw new Exception($"Stock insuficiente para la prenda en prueba. Disponible: {inventario.StockActual}");
        }

        inventario.StockActual -= request.Cantidad;

        var entity = new ClientePrendaEnCurso
        {
            TenantId = tenantId,
            ClienteId = cliente.Id,
            VarianteProductoId = variante.Id,
            Cantidad = request.Cantidad,
            PrecioReferencia = request.PrecioReferencia,
            Estado = EstadoPrendaCliente.EnPrueba
        };

        _context.PrendasClientesEnCurso.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

