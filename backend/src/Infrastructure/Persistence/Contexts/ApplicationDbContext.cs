using System.Data;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
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
            cmd.CommandText = $"SET SESSION \"app.current_tenant\" = '{tenantId.Value}';";
            cmd.ExecuteNonQuery();
        }
    }

    private async Task SetTenantSessionAsync(DbConnection connection)
    {
        var tenantId = _tenantResolver.TenantId;
        if (tenantId.HasValue)
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = $"SET SESSION \"app.current_tenant\" = '{tenantId.Value}';";
            await cmd.ExecuteNonQueryAsync();
        }
    }
}

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ITenantResolver _tenantResolver;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantResolver tenantResolver) : base(options)
    {
        _tenantResolver = tenantResolver;
    }

    public DbSet<Inquilino> Inquilinos => Set<Inquilino>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Sucursal> Sucursales => Set<Sucursal>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ModuloSuscripcion> ModulosSuscripcion => Set<ModuloSuscripcion>();
    
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

    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<VentaDetalle> VentasDetalles => Set<VentaDetalle>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();

    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<TelemetriaUso> TelemetriasUso => Set<TelemetriaUso>();

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
    }

    private void ApplyGlobalFilters<T>(ModelBuilder builder) where T : class
    {
        bool hasTenant = typeof(IMustHaveTenant).IsAssignableFrom(typeof(T));
        bool hasSoftDelete = typeof(ISoftDelete).IsAssignableFrom(typeof(T));

        if (hasTenant && hasSoftDelete)
        {
            builder.Entity<T>().HasQueryFilter(e => ((IMustHaveTenant)e).TenantId == CurrentTenantId && !((ISoftDelete)e).IsDeleted);
        }
        else if (hasTenant)
        {
            builder.Entity<T>().HasQueryFilter(e => ((IMustHaveTenant)e).TenantId == CurrentTenantId);
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
