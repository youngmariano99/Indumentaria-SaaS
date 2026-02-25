using System;
using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class TelemetriaUso : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public MetricaUso Metrica { get; set; }
    public int Cantidad { get; set; }
    
    public int Mes { get; set; }
    public int Año { get; set; }
}
