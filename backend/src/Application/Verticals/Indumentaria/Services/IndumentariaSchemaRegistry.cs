using Application.DTOs.Catalog;
using Application.Shared.Interfaces;

namespace Application.Verticals.Indumentaria.Services;

public class IndumentariaSchemaRegistry : ISchemaRegistry
{
    public Task<FormSchemaDto> ObtenerEsquemaProductoAsync(Guid tenantId)
    {
        var schema = new FormSchemaDto
        {
            DynamicGrid = "VariantesGrid",
            SmartDefaults = new Dictionary<string, object>
            {
                { "tipoProducto", "Remeras" }
            },
            Fields = new List<FormFieldDto>
            {
                new FormFieldDto { Name = "nombre", Label = "Nombre del Producto", Type = "text", Required = true, GridSpan = 2 },
                new FormFieldDto { Name = "descripcion", Label = "Descripción", Type = "text", Required = false, GridSpan = 2 },
                new FormFieldDto { Name = "precioBase", Label = "Precio Base $", Type = "number", Required = true, GridSpan = 1 },
                new FormFieldDto { Name = "categoriaId", Label = "Categoría", Type = "select", Required = true, OptionsEndpoint = "/api/categorias", GridSpan = 1 },
                new FormFieldDto { Name = "temporada", Label = "Temporada", Type = "select", Required = false, Options = new List<string> { "", "Primavera-Verano 2025", "Otoño-Invierno 2025", "Primavera-Verano 2026", "Todo el año" }, GridSpan = 1 },
                new FormFieldDto { Name = "tipoProducto", Label = "Tipo de Prenda", Type = "select", Required = true, Options = new List<string> { "Remeras", "Pantalones", "Buzos", "Camperas", "Zapatillas", "Accesorios" }, GridSpan = 1 }
            }
        };

        return Task.FromResult(schema);
    }
}
