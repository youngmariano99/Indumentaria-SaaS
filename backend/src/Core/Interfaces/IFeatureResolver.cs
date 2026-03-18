namespace Core.Interfaces;

/// <summary>
/// Provee métodos para verificar si una funcionalidad (Feature) está habilitada para el contexto actual.
/// </summary>
public interface IFeatureResolver
{
    /// <summary>
    /// Verifica si una feature está activa siguiendo la jerarquía: Usuario > Sucursal > Inquilino > Rubro.
    /// </summary>
    /// <param name="featureKey">Clave de la feature (ej: "ModuloCRM", "MatrizTalles").</param>
    /// <returns>True si está habilitada, False en caso contrario o si no existe (Default OFF).</returns>
    bool IsEnabled(string featureKey);

    /// <summary>
    /// Versión asíncrona para cuando se requiere consultar la base de datos por primera vez.
    /// </summary>
    Task<bool> IsEnabledAsync(string featureKey);

    /// <summary>
    /// <summary>
    /// Obtiene todas las features activas para el contexto actual. Útil para el frontend.
    /// </summary>
    Task<Dictionary<string, bool>> GetAllEnabledAsync();

    /// <summary>
    /// Remueve la caché de features para un inquilino y usuario específico.
    /// </summary>
    void InvalidateCache(Guid tenantId, Guid? userId);
}
