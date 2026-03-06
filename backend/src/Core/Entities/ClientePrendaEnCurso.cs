using Core.Entities.Base;
using Core.Enums;
using Core.Interfaces;

namespace Core.Entities;

public class ClientePrendaEnCurso : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    public Guid? VarianteProductoId { get; set; }
    public VarianteProducto? VarianteProducto { get; set; }

    // Campos manuales para registrar prendas/deudas históricas sin exigir una variante vigente de stock.
    public string? ProductoManualNombre { get; set; }
    public string? VarianteManualNombre { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioReferencia { get; set; }

    public EstadoPrendaCliente Estado { get; set; } = EstadoPrendaCliente.EnPrueba;
}

