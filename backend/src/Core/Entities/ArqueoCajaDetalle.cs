using System;
using Core.Entities.Base;

namespace Core.Entities;

public class ArqueoCajaDetalle : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid ArqueoCajaId { get; set; }
    public ArqueoCaja ArqueoCaja { get; set; } = null!;

    public Guid MetodoPagoId { get; set; }
    public MetodoPago MetodoPago { get; set; } = null!;

    // Lo que el sistema dice basado en transacciones
    public decimal MontoEsperado { get; set; }
    
    // Lo que el cajero cargó físicamente (Blind Closing)
    public decimal MontoReal { get; set; }

    public decimal Diferencia { get; set; }
}
