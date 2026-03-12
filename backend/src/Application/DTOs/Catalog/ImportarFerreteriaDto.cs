using System.Collections.Generic;

namespace Application.DTOs.Catalog;

public class ImportarFerreteriaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? CategoriaNombre { get; set; } // Nombre para buscar o crear categoría
    public decimal PrecioCosto { get; set; }
    public decimal PrecioVenta { get; set; }
    public decimal StockInicial { get; set; }
    public string? SKU { get; set; }
    public string? Ean13 { get; set; }
    
    // Diccionario para atributos dinámicos (Medida, Material, etc)
    public Dictionary<string, string> Metadatos { get; set; } = new();
}
