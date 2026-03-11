using Application.DTOs.Catalog;
using Core.Entities;

namespace Application.Shared.Interfaces;

public interface ICreadorProductoStrategy
{
    Task<(List<VarianteProducto> Variantes, List<Inventario> Inventarios)> GenerarVariantesEInventarioAsync(Producto productoPadre, CrearProductoDto dto, Guid tenantId);
}
