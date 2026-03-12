using Core.Interfaces;

namespace Infrastructure.Verticals;

public class FerreteriaRules : IVerticalRules
{
    public string RubroSlug => "ferreteria";

    public string GetTerm(string key, string fallback)
    {
        return key.ToLower() switch
        {
            "producto" => "Artículo",
            "variante" => "Medida/Material",
            _ => fallback
        };
    }

    public bool SoportaFraccionamiento => true;
    public bool RequiereStockDefectuoso => true;

    public void ValidarProducto(object producto)
    {
        // Lógica específica: ej, validar SKUs técnicos
    }
}
