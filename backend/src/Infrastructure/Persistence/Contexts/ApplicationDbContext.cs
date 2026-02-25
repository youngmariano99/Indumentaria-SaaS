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

public class ApplicationDbContext : DbContext
{
    private readonly ITenantResolver _tenantResolver;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantResolver tenantResolver) : base(options)
    {
        _tenantResolver = tenantResolver;
    }

    public DbSet<Inquilino> Inquilinos => Set<Inquilino>();
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

    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<TelemetriaUso> TelemetriasUso => Set<TelemetriaUso>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Se aplican las configuraciones de FluentAPI de manera limpia (IEntityTypeConfiguration)
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // 1. Aplicación automática de Global Query Filters para evitar fuga de datos
        // Iteramos sobre todas las entidades del modelo mapeado que implementen IMustHaveTenant
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(ApplyGlobalTenantFilter), BindingFlags.NonPublic | BindingFlags.Instance)
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

    private void ApplyGlobalTenantFilter<T>(ModelBuilder builder) where T : class, IMustHaveTenant
    {
        builder.Entity<T>().HasQueryFilter(e => e.TenantId == CurrentTenantId);
    }

    public Guid CurrentTenantId => _tenantResolver.TenantId ?? Guid.Empty;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Posibilidad de configurar mapeo por defecto aquí, ej:
        // configurationBuilder.Properties<decimal>().HavePrecision(18, 4);
    }
}
