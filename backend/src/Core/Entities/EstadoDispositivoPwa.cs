using System;
using Core.Entities.Base;

namespace Core.Entities;

public class EstadoDispositivoPwa : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    /// <summary>
    /// Identificador único del dispositivo/navegador generado localmente (ej: UUID de Dexie)
    /// </summary>
    public string DispositivoId { get; set; } = string.Empty;

    /// <summary>
    /// Nombre descriptivo que el usuario le da al dispositivo o generado automáticamente (ej: "Caja Principal")
    /// </summary>
    public string NombreDispositivo { get; set; } = string.Empty;
    
    /// <summary>
    /// Versión de la app (JS/PWA) que el cliente está corriendo actualmente.
    /// Útil para forzar recargas si han quedado obsoletos.
    /// </summary>
    public string AppVersion { get; set; } = string.Empty;

    /// <summary>
    /// Marca temporal (UTC) de la última recepción de ping
    /// </summary>
    public DateTime UltimaVezOnline { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Cantidad de transacciones/operaciones locales que el dispositivo tiene sin sincronizar
    /// hacia la nube (Tamaño de la Sync Queue).
    /// </summary>
    public int ItemsPendientesSubida { get; set; } = 0;
}
