using System.Threading.Tasks;
using Application.DTOs.Catalog;

namespace Application.Shared.Interfaces;

/// <summary>
/// Interfaz base para validación de productos. 
/// Implementa el Patrón Estrategia para soportar validaciones
/// específicas por cada Rubro Comercial sin usar condicionales if/else globales.
/// </summary>
public interface IValidadorProducto
{
    /// <summary>
    /// Valida un producto antes de su creación o actualización.
    /// Retorna una lista de mensajes de error si la validación falla.
    /// Si la lista está vacía, la validación fue exitosa.
    /// </summary>
    Task<List<string>> ValidarAsync(CrearProductoDto productoDto);
}
