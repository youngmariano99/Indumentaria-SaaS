using System;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Core.Entities;
using Core.Entities.Base;
using Core.Interfaces;
using Infrastructure.Persistence.Interceptors;

using Application.Common.Interfaces;

namespace Infrastructure.Persistence.Contexts;

public class TenantSessionInterceptor : DbConnectionInterceptor
{
    private readonly ITenantResolver _tenantResolver;

    public TenantSessionInterceptor(ITenantResolver tenantResolver)
    {
        _tenantResolver = tenantResolver;
    }

    public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
    {
        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
        await SetTenantSessionAsync(connection);
    }

    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        base.ConnectionOpened(connection, eventData);
        SetTenantSession(connection);
    }

    private void SetTenantSession(DbConnection connection)
    {
        var tenantId = _tenantResolver.TenantId;
        if (tenantId.HasValue)
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = $"SET LOCAL app.current_tenant = '{tenantId.Value}';";
            cmd.ExecuteNonQuery();
        }
    }

    private async Task SetTenantSessionAsync(DbConnection connection)
    {
        var tenantId = _tenantResolver.TenantId;
        if (tenantId.HasValue)
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = $"SET LOCAL app.current_tenant = '{tenantId.Value}';";
            await cmd.ExecuteNonQueryAsync();
        }
    }
}

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ITenantResolver _tenantResolver;
    private bool _bypassFilters = false;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantResolver tenantResolver)
        : base(options)
    {
        _tenantResolver = tenantResolver;
    }

    public void EnterBypassMode()
    {
        _bypassFilters = true;
    }

    public DbSet<Inquilino> Inquilinos => Set<Inquilino>();
    public DbSet<Rubro> Rubros => Set<Rubro>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Sucursal> Sucursales => Set<Sucursal>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ModuloSuscripcion> ModulosSuscripcion => Set<ModuloSuscripcion>();
    
    public DbSet<EstadoDispositivoPwa> EstadosDispositivosPwa => Set<EstadoDispositivoPwa>();
    
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<VarianteProducto> VariantesProducto => Set<VarianteProducto>();
    public DbSet<Inventario> Inventarios => Set<Inventario>();

    public DbSet<Comprobante> Comprobantes => Set<Comprobante>();
    public DbSet<ItemComprobante> ItemsComprobante => Set<ItemComprobante>();
    public DbSet<CertificadoDigital> CertificadosDigitales => Set<CertificadoDigital>();
    public DbSet<LogFiscal> LogsFiscales => Set<LogFiscal>();

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<BilleteraVirtual> BilleterasVirtuales => Set<BilleteraVirtual>();
    public DbSet<TransaccionBilletera> TransaccionesBilleteras => Set<TransaccionBilletera>();
    public DbSet<MovimientoSaldoCliente> MovimientosSaldosClientes => Set<MovimientoSaldoCliente>();
    public DbSet<ClientePrendaEnCurso> PrendasClientesEnCurso => Set<ClientePrendaEnCurso>();

    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<VentaDetalle> VentasDetalles => Set<VentaDetalle>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();

    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<TelemetriaUso> TelemetriasUso => Set<TelemetriaUso>();
    public DbSet<ArqueoCaja> ArqueosCaja => Set<ArqueoCaja>();
    public DbSet<ArqueoCajaDetalle> ArqueosCajaDetalle => Set<ArqueoCajaDetalle>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Se aplican las configuraciones de FluentAPI de manera limpia (IEntityTypeConfiguration)
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // 1. Aplicación automática de Global Query Filters para evitar fuga de datos y baja lógica
        // Iteramos sobre todas las entidades del modelo mapeado
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType) || typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(ApplyGlobalFilters), BindingFlags.NonPublic | BindingFlags.Instance)
                    ?.MakeGenericMethod(entityType.ClrType);

                method?.Invoke(this, new object[] { builder });
            }
        }

        builder.Entity<Rubro>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DiccionarioJson).HasColumnType("jsonb");
            entity.Property(e => e.EsquemaMetadatosJson).HasColumnType("jsonb");
            entity.Property(e => e.FeaturesJson).HasColumnType("jsonb");
        });

        builder.Entity<Inquilino>(entity =>
        {
            entity.Property(e => e.FeaturesJson).HasColumnType("jsonb");
        });

        builder.Entity<Sucursal>(entity =>
        {
            entity.Property(e => e.FeaturesJson).HasColumnType("jsonb");
        });

        builder.Entity<Usuario>(entity =>
        {
            entity.Property(e => e.FeaturesJson).HasColumnType("jsonb");
        });

        // Configuración especial de la tabla LogsAuditoria: Campos JSONB y convenciones de nombre
        builder.Entity<LogAuditoria>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OldValues).HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnType("jsonb");
        });
        
        // Configuración similar para LogFiscal que consume JSONB
        builder.Entity<LogFiscal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RequestJson).HasColumnType("jsonb");
            entity.Property(e => e.ResponseJson).HasColumnType("jsonb");
        });

        builder.Entity<ArqueoCaja>(entity =>
        {
            entity.HasMany(x => x.Detalles).WithOne(x => x.ArqueoCaja).HasForeignKey(x => x.ArqueoCajaId);
        });

        builder.Entity<ArqueoCajaDetalle>(entity =>
        {
            entity.HasOne(x => x.MetodoPago).WithMany().HasForeignKey(x => x.MetodoPagoId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Producto>(entity =>
        {
            entity.Property(p => p.MetadatosJson).HasColumnType("jsonb");
            entity.HasIndex(p => p.MetadatosJson).HasMethod("gin");
        });

        builder.Entity<VarianteProducto>(entity =>
        {
            entity.Property(v => v.AtributosJson).HasColumnType("jsonb");
            entity.HasIndex(v => v.AtributosJson).HasMethod("gin");
        });
    }

    private void ApplyGlobalFilters<T>(ModelBuilder builder) where T : class
    {
        bool hasTenant = typeof(IMustHaveTenant).IsAssignableFrom(typeof(T));
        bool hasSoftDelete = typeof(ISoftDelete).IsAssignableFrom(typeof(T));

        if (hasTenant && hasSoftDelete)
        {
            builder.Entity<T>().HasQueryFilter(e => _bypassFilters || (((IMustHaveTenant)e).TenantId == CurrentTenantId && !((ISoftDelete)e).IsDeleted));
        }
        else if (hasTenant)
        {
            builder.Entity<T>().HasQueryFilter(e => _bypassFilters || (((IMustHaveTenant)e).TenantId == CurrentTenantId));
        }
        else if (hasSoftDelete)
        {
            builder.Entity<T>().HasQueryFilter(e => !((ISoftDelete)e).IsDeleted);
        }
    }

    public Guid CurrentTenantId => _tenantResolver.TenantId ?? Guid.Empty;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Posibilidad de configurar mapeo por defecto aquí, ej:
        // configurationBuilder.Properties<decimal>().HavePrecision(18, 4);
    }
}
