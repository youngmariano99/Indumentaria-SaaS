using Core.Interfaces;

namespace Infrastructure.Verticals;

public class IndumentariaRules : IVerticalRules
{
    public string RubroSlug => "indumentaria";

    public string GetTerm(string key, string fallback)
    {
        return key.ToLower() switch
        {
            "producto" => "Prenda",
            "variante" => "Talle/Color",
            _ => fallback
        };
    }

    public bool SoportaFraccionamiento => false;
    public bool RequiereStockDefectuoso => false;

    public void ValidarProducto(object producto)
    {
        // Lógica específica: ej, validar que tenga al menos un talle/color
    }
}
