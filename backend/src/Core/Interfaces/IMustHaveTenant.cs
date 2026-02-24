namespace Core.Interfaces;

/// <summary>
/// Interfaz para asegurar el Multi-Tenancy a nivel de base de datos usando Global Query Filters.
/// Toda entidad que pertenezca a un Inquilino debe implementar esta interfaz.
/// </summary>
public interface IMustHaveTenant
{
    Guid TenantId { get; set; }
}
