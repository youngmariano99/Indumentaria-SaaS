using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    void EnterBypassMode();

    DbSet<Inquilino> Inquilinos { get; }
    DbSet<Rubro> Rubros { get; }
    DbSet<Sucursal> Sucursales { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<AtributoConfiguracion> AtributosConfiguracion { get; }
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }
    DbSet<Usuario> Usuarios { get; }
    DbSet<ModuloSuscripcion> ModulosSuscripcion { get; }
    DbSet<LogAuditoria> LogsAuditoria { get; }
    DbSet<Inventario> Inventarios { get; }
    DbSet<ArqueoCaja> ArqueosCaja { get; }
    DbSet<ArqueoCajaDetalle> ArqueosCajaDetalle { get; }

    DatabaseFacade Database { get; }

    DbSet<Cliente> Clientes { get; }
    DbSet<MovimientoSaldoCliente> MovimientosSaldosClientes { get; }
    DbSet<ClientePrendaEnCurso> PrendasClientesEnCurso { get; }

    // Sprint 4: Punto de Venta
    DbSet<Venta> Ventas { get; }
    DbSet<VentaDetalle> VentasDetalles { get; }
    DbSet<MetodoPago> MetodosPago { get; }
    DbSet<EstadoDispositivoPwa> EstadosDispositivosPwa { get; }

    // Módulo Proveedores
    DbSet<Proveedor> Proveedores { get; }
    DbSet<FacturaProveedor> FacturasProveedores { get; }
    DbSet<PagoProveedor> PagosProveedores { get; }
    DbSet<DistribucionPagoFactura> DistribucionesPagosFacturas { get; }
    DbSet<ChequeTercero> ChequesTerceros { get; }
    DbSet<ProveedorProducto> ProveedoresProductos { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
