using System;
using Core.Entities.Base;
using Core.Interfaces;

namespace Core.Entities;

public enum TipoMovimientoSaldo
{
    Ingreso = 1, // Suma saldo a favor (Ej: el cliente dejó plata, o se hizo devolución a favor)
    Egreso = 2   // Resta saldo a favor (Ej: el cliente usó el saldo para pagar una compra)
}

public class MovimientoSaldoCliente : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    public decimal Monto { get; set; }
    public TipoMovimientoSaldo Tipo { get; set; }
    
    // Motivo del movimiento (Ej: "Ajuste manual", "Devolución Ticket #XYZ", "Pago Parcial")
    public string Descripcion { get; set; } = string.Empty;

    // Relación opcional con la venta si el saldo se usó o se generó a partir de una de ellas
    public Guid? VentaIdAsociada { get; set; }
    public Venta? VentaAsociada { get; set; }

    // Relación opcional con el método de pago (Efectivo, Transferencia, etc.) 
    // Útil para arqueo de caja en ajustes manuales
    public Guid? MetodoPagoId { get; set; }
    public MetodoPago? MetodoPago { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
