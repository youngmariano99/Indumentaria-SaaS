using System;
using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class Cliente : BaseEntity, IMustHaveTenant, ISoftDelete
{
    public Guid TenantId { get; set; }
    
    public string Documento { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    // CRM y Contacto Adicional
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    
    // Requisito Fiscal Futuro (ARCA)
    public CondicionIva? CondicionIva { get; set; }
    
    // Almacena preferencias visuales o talles favoritos (JSONB)
    public string PreferenciasJson { get; set; } = "{}";

    // CRM - Billetera Virtual del Cliente
    public decimal SaldoAFavor { get; set; } = 0;

    // Para evitar romper reportes de venta de tickets viejos
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
