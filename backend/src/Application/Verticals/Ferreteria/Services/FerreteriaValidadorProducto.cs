using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Catalog;
using Application.Shared.Interfaces;

namespace Application.Verticals.Ferreteria.Services;

/// <summary>
/// Validador específico para el rubro de Ferretería.
/// </summary>
public class FerreteriaValidadorProducto : IValidadorProducto
{
    public Task<List<string>> ValidarAsync(CrearProductoDto productoDto)
    {
        var errores = new List<string>();

        if (productoDto == null)
        {
            errores.Add("El producto no puede ser nulo.");
            return Task.FromResult(errores);
        }

        // Reglas estrictas de Ferretería:
        // A diferencia de Indumentaria, NO exige talles ni colores.
        // Un martillo puede no tener variantes.
        
        // Aquí podríamos validar que `PrecioCosto` general no sea nulo, 
        // o que tenga un atributo obligatorio como "Marca" en los metadatos.

        return Task.FromResult(errores);
    }
}
