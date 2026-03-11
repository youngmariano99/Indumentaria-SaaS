using Application.DTOs.Catalog;

namespace Application.Shared.Interfaces;

public interface ISchemaRegistry
{
    Task<FormSchemaDto> ObtenerEsquemaProductoAsync(Guid tenantId);
}
