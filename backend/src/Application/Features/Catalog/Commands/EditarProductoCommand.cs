using System.Text.Json;
using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Commands;

public class EditarProductoCommand : IRequest<bool>
{
    public Guid ProductoId { get; set; }
    public EditarProductoDto Payload { get; set; } = new();
}

public class EditarProductoCommandHandler : IRequestHandler<EditarProductoCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public EditarProductoCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(EditarProductoCommand request, CancellationToken cancellationToken)
    {
        var producto = await _dbContext.Productos
            .FirstOrDefaultAsync(p => p.Id == request.ProductoId, cancellationToken);

        if (producto == null) return false;

        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        
        try
        {
            // 1. Actualizar Entidad Padre
            producto.Nombre = request.Payload.Nombre;
            producto.Descripcion = request.Payload.Descripcion;
            producto.PrecioBase = request.Payload.PrecioBase;
            producto.CategoriaId = request.Payload.CategoriaId;
            producto.Temporada = request.Payload.Temporada;
            producto.TipoProducto = request.Payload.TipoProducto;
            producto.PesoKg = request.Payload.PesoKg;
            producto.Ean13 = request.Payload.Ean13;
            producto.Origen = request.Payload.Origen;
            producto.EscalaTalles = request.Payload.EscalaTalles;

            // 2. Actualizar Variantes Hijas (Solo variables dependientes de precio y atributos extra)
            var variantesExistentes = await _dbContext.VariantesProducto
                .Where(v => v.ProductId == request.ProductoId)
                .ToListAsync(cancellationToken);

            foreach (var inputVar in request.Payload.Variantes)
            {
                var target = variantesExistentes.FirstOrDefault(v => v.Id == inputVar.Id);
                if (target != null)
                {
                    target.PrecioCosto = inputVar.PrecioCosto;
                    target.PrecioOverride = inputVar.PrecioOverride;
                    target.AtributosJson = inputVar.Atributos != null && inputVar.Atributos.Count > 0
                        ? JsonSerializer.Serialize(inputVar.Atributos)
                        : "{}";
                }
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
