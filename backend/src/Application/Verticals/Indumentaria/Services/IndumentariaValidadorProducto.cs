using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs.Catalog;
using Application.Shared.Interfaces;

namespace Application.Verticals.Indumentaria.Services;

/// <summary>
/// Validador específico para el rubro de Indumentaria (Ropa).
/// </summary>
public class IndumentariaValidadorProducto : IValidadorProducto
{
    public Task<List<string>> ValidarAsync(CrearProductoDto productoDto)
    {
        var errores = new List<string>();

        if (productoDto == null)
        {
            errores.Add("El producto no puede ser nulo.");
            return Task.FromResult(errores);
        }

        // Reglas estrictas de Indumentaria:
        // Todo producto debe tener variantes (talle y color)
        if (productoDto.Variantes == null || !productoDto.Variantes.Any())
        {
            errores.Add("[Indumentaria] Las prendas deben tener obligatoriamente variantes de Talle y Color.");
        }
        else
        {
            foreach (var variante in productoDto.Variantes)
            {
                if (string.IsNullOrWhiteSpace(variante.Talle))
                {
                    errores.Add("[Indumentaria] Todas las variantes deben especificar un Talle.");
                }
                
                if (string.IsNullOrWhiteSpace(variante.Color))
                {
                    errores.Add("[Indumentaria] Todas las variantes deben especificar un Color.");
                }
            }
        }

        return Task.FromResult(errores);
    }
}
