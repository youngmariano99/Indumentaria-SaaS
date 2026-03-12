using System;

namespace Core.Interfaces;

/// <summary>
/// Define las reglas de negocio y comportamiento específicas para cada rubro (Vertical).
/// Implementar esta interfaz para cada nuevo rubro para evitar condicionales estáticos en el Core.
/// </summary>
public interface IVerticalRules
{
    string RubroSlug { get; }
    
    // Terminología
    string GetTerm(string key, string fallback);
    
    // Reglas de Inventario
    bool SoportaFraccionamiento { get; }
    bool RequiereStockDefectuoso { get; }
    
    // Validaciones de Producto
    void ValidarProducto(object producto); // Podría refinarse con tipos genéricos
}
