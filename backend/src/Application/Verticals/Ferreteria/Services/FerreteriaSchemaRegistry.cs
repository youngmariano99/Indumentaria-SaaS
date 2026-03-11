using Application.DTOs.Catalog;
using Application.Shared.Interfaces;

namespace Application.Verticals.Ferreteria.Services;

public class FerreteriaSchemaRegistry : ISchemaRegistry
{
    public Task<FormSchemaDto> ObtenerEsquemaProductoAsync(Guid tenantId)
    {
        var schema = new FormSchemaDto
        {
            DynamicGrid = "VariantesGrid", // Apuntará al VariantesGrid dummy que creamos
            SmartDefaults = new Dictionary<string, object>
            {
                { "tipoProducto", "Tornillos" }
            },
            Fields = new List<FormFieldDto>
            {
                new FormFieldDto { Name = "nombre", Label = "Nombre del Material", Type = "text", Required = true, GridSpan = 2 },
                new FormFieldDto { Name = "descripcion", Label = "Descripción técnica", Type = "text", Required = false, GridSpan = 2 },
                new FormFieldDto { Name = "precioBase", Label = "Precio de Venta $", Type = "number", Required = true, GridSpan = 1 },
                new FormFieldDto { Name = "ean13", Label = "Código de Barras", Type = "text", Required = false, GridSpan = 1 },
                new FormFieldDto { Name = "categoriaId", Label = "Categoría", Type = "select", Required = true, OptionsEndpoint = "/api/categorias", GridSpan = 1 },
                // Observar que NO incluímos Temporada ni Tipo de Prenda.
            }
        };

        return Task.FromResult(schema);
    }
}
