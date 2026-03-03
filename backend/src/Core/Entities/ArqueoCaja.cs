using System;
using Core.Entities.Base;

namespace Core.Entities;

public enum EstadoArqueo
{
    Abierto = 1,
    Cerrado = 2,
    Auditado = 3
}

public class ArqueoCaja : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    // Sucursal a la que pertenece la caja
    public Guid StoreId { get; set; }

    // Cajero responsable de esta sesión
    public Guid UsuarioId { get; set; }

    public DateTime FechaApertura { get; set; } = DateTime.UtcNow;
    public DateTime? FechaCierre { get; set; }

    // Saldo con el que arranca el cajero
    public decimal SaldoInicial { get; set; }

    // Totales calculados al cerrar
    public decimal TotalVentasEsperado { get; set; }
    public decimal TotalManualEsperado { get; set; } // Ingresos/Egresos manuales
    public decimal TotalRealContado { get; set; }
    
    public decimal Diferencia { get; set; }
    
    public EstadoArqueo Estado { get; set; } = EstadoArqueo.Abierto;
    
    public string? Observaciones { get; set; }

    // Desglose por método de pago
    public ICollection<ArqueoCajaDetalle> Detalles { get; set; } = new List<ArqueoCajaDetalle>();
}
