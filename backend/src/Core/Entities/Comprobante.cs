using System;
using System.Collections.Generic;
using Core.Entities.Base;
using Core.Enums;

namespace Core.Entities;

public class Comprobante : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    
    public string Tipo { get; set; } = string.Empty; // A, B, C, M, NC
    public EstadoComprobante Estado { get; set; }
    
    public string? CAE { get; set; }
    public DateTime? VencimientoCAE { get; set; }
    
    public decimal TotalNeto { get; set; }
    public decimal TotalIva { get; set; }
    public decimal Total { get; set; }
    
    public virtual ICollection<ItemComprobante> Items { get; set; } = new List<ItemComprobante>();
}
