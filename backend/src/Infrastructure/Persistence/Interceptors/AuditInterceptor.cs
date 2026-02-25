using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Persistence.Interceptors;

public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ITenantResolver _tenantResolver;

    public AuditInterceptor(ITenantResolver tenantResolver)
    {
        _tenantResolver = tenantResolver;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ProcessAudits(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        ProcessAudits(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ProcessAudits(DbContext? context)
    {
        if (context == null) return;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        var auditEntries = new List<LogAuditoria>();
        var tenantId = _tenantResolver.TenantId ?? Guid.Empty;
        var timestamp = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            // Ignorar la propia tabla de auditoría para no crear un bucle infinito
            if (entry.Entity is LogAuditoria) continue;

            var audit = new LogAuditoria
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.Empty, // TODO: Esto se obtendrá del ICurrentUserCersolver en el Sprint 4
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                Timestamp = timestamp,
                IpAddress = "127.0.0.1" // TODO: Leer del HttpContext
            };

            // Obtener Primary Key
            var pkName = entry.Metadata.FindPrimaryKey()?.Properties.Select(p => p.Name).FirstOrDefault();
            if (pkName != null && entry.State != EntityState.Added)
            {
                audit.PrimaryKey = entry.Property(pkName).CurrentValue?.ToString();
            }

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;

                switch (entry.State)
                {
                    case EntityState.Added:
                        newValues[propertyName] = property.CurrentValue;
                        break;
                    case EntityState.Deleted:
                        oldValues[propertyName] = property.OriginalValue;
                        break;
                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            oldValues[propertyName] = property.OriginalValue;
                            newValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }

            // Utilizando System.Text.Json (nativo)
            audit.OldValues = JsonSerializer.Serialize(oldValues);
            audit.NewValues = JsonSerializer.Serialize(newValues);

            auditEntries.Add(audit);
        }

        if (auditEntries.Any())
        {
            context.Set<LogAuditoria>().AddRange(auditEntries);
        }
    }
}
