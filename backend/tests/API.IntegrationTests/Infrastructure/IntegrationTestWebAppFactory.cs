using System;
using System.Linq;
using Infrastructure.Persistence.Contexts;
using Infrastructure.Persistence.Interceptors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace API.IntegrationTests.Infrastructure;

public class IntegrationTestWebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remover la conexión real a PostgreSQL
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Registrar DbContext con InMemory Database para pruebas rápidas
            services.AddDbContext<ApplicationDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase("Indumentaria_TestDb");
                options.ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning));
                
                var auditInterceptor = sp.GetRequiredService<AuditInterceptor>();
                var sessionInterceptor = sp.GetRequiredService<TenantSessionInterceptor>();
                options.AddInterceptors(auditInterceptor, sessionInterceptor);
            });

            // Construir el Service Provider para realizar el Build de la BD
            var spBuild = services.BuildServiceProvider();
            using var scope = spBuild.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<ApplicationDbContext>();

            // Asegurarnos que la base de datos se cree limpia por cada ciclo
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            // Semilla de Inquilino y Usuario para que el Login funcione
            var tenantId = System.Guid.Parse("00000000-0000-0000-0000-000000000001");
            db.Inquilinos.Add(new Core.Entities.Inquilino
            {
                Id = tenantId,
                NombreComercial = "Tienda Demo",
                Subdominio = "demo"
            });

            var hasher = scopedServices.GetRequiredService<Core.Interfaces.Auth.IPasswordHasher>();
            db.Set<Core.Entities.Usuario>().Add(new Core.Entities.Usuario
            {
                Id = System.Guid.Parse("00000000-0000-0000-0000-000000000002"),
                TenantId = tenantId,
                Nombre = "Admin Demo",
                Email = "test@test.com",
                PasswordHash = hasher.Hash("123456"),
                Rol = Core.Enums.SystemRole.Owner
            });
            
            db.SaveChanges();
        });
    }
}
