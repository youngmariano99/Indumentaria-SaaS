using System;
using System.Text.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Application.Common.Interfaces;

namespace Infrastructure.Services;

/// <summary>
/// Implementación del resolvedor de features con jerarquía: Rubro < Inquilino < Sucursal < Usuario.
/// Utiliza IMemoryCache para optimizar las consultas repetitivas.
/// </summary>
public class FeatureResolver : IFeatureResolver
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;
    private readonly IMemoryCache _cache;

    public FeatureResolver(
        IApplicationDbContext context,
        ITenantResolver tenantResolver,
        IMemoryCache cache)
    {
        _context = context;
        _tenantResolver = tenantResolver;
        _cache = cache;
    }

    public bool IsEnabled(string featureKey)
    {
        // Ejecución síncrona (usada en controladores o vistas que no son async)
        return IsEnabledAsync(featureKey).GetAwaiter().GetResult();
    }

    public async Task<bool> IsEnabledAsync(string featureKey)
    {
        var tenantId = _tenantResolver.TenantId;
        if (!tenantId.HasValue) return false;

        var userId = _tenantResolver.UserId;
        var sucursalId = _tenantResolver.SucursalId;
        var rubroId = _tenantResolver.RubroId;

        // Si no tenemos RubroId pero tenemos TenantId, intentamos deducirlo del Inquilino
        if (!rubroId.HasValue)
        {
            // Nota: En una app real, esto debería estar ya en el TenantResolver tras el login.
            // Aquí lo resolvemos si falta.
            _context.EnterBypassMode(); // Saltamos RLS para leer el inquilino base
            var tenantRecord = await _context.Inquilinos.AsNoTracking()
                .Select(t => new { t.Id, t.RubroId })
                .FirstOrDefaultAsync(t => t.Id == tenantId.Value);
            
            rubroId = tenantRecord?.RubroId;
        }

        string cacheKey = GetCacheKey(tenantId.Value, sucursalId, userId, rubroId);

        if (!_cache.TryGetValue(cacheKey, out Dictionary<string, bool>? features))
        {
            features = await LoadFeaturesAsync(tenantId.Value, sucursalId, userId, rubroId);
            _cache.Set(cacheKey, features, TimeSpan.FromMinutes(10)); // Caché de 10 min
        }

        return features != null && features.TryGetValue(featureKey, out bool enabled) && enabled;
    }

    public async Task<Dictionary<string, bool>> GetAllEnabledAsync()
    {
        var tenantId = _tenantResolver.TenantId;
        if (!tenantId.HasValue) return new Dictionary<string, bool>();

        var userId = _tenantResolver.UserId;
        var sucursalId = _tenantResolver.SucursalId;
        var rubroId = _tenantResolver.RubroId;

        string cacheKey = GetCacheKey(tenantId.Value, sucursalId, userId, rubroId);

        if (!_cache.TryGetValue(cacheKey, out Dictionary<string, bool>? features))
        {
            features = await LoadFeaturesAsync(tenantId.Value, sucursalId, userId, rubroId);
            _cache.Set(cacheKey, features, TimeSpan.FromMinutes(10));
        }

        return features ?? new Dictionary<string, bool>();
    }

    public void InvalidateCache(Guid tenantId, Guid? userId)
    {
        // Como la clave actual depende de SucursalId y RubroId (que pueden ser null), 
        // pero el UserId es único, vamos a normalizar la clave para que sea fácil de borrar.
        // O mejor, borramos las variaciones más probables.
        // Por ahora, usemos la lógica de GetCacheKey.
        var rubroId = _tenantResolver.RubroId;
        var sucursalId = _tenantResolver.SucursalId;
        
        string cacheKey = GetCacheKey(tenantId, sucursalId, userId, rubroId);
        _cache.Remove(cacheKey);
    }

    private string GetCacheKey(Guid tenantId, Guid? sucursalId, Guid? userId, Guid? rubroId)
    {
        return $"features_{tenantId}_{sucursalId}_{userId}_{rubroId}";
    }

    private async Task<Dictionary<string, bool>> LoadFeaturesAsync(Guid tenantId, Guid? sucursalId, Guid? userId, Guid? rubroId)
    {
        var result = new Dictionary<string, bool>();

        // 1. Cargar features del Rubro (Nivel más bajo / Global por industria)
        if (rubroId.HasValue)
        {
            _context.EnterBypassMode();
            var rubro = await _context.Rubros.AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == rubroId.Value);
            MergeFeatures(result, rubro?.FeaturesJson);
        }

        // 2. Cargar features del Inquilino (Override del cliente empresarial)
        _context.EnterBypassMode();
        var tenant = await _context.Inquilinos.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);
        MergeFeatures(result, tenant?.FeaturesJson);

        // 3. Cargar features de la Sucursal (Override por local físico)
        if (sucursalId.HasValue)
        {
            _context.EnterBypassMode();
            var sucursal = await _context.Sucursales.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sucursalId.Value);
            MergeFeatures(result, sucursal?.FeaturesJson);
        }

        // 4. Cargar features del Usuario (Override final por permisos específicos del usuario)
        if (userId.HasValue)
        {
            _context.EnterBypassMode();
            var usuario = await _context.Usuarios.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId.Value);
            MergeFeatures(result, usuario?.FeaturesJson);
        }

        return result;
    }

    private void MergeFeatures(Dictionary<string, bool> target, string? json)
    {
        if (string.IsNullOrEmpty(json) || json == "{}" || json == "[]") return;

        try
        {
            var source = JsonSerializer.Deserialize<Dictionary<string, bool>>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });
            
            if (source == null) return;

            foreach (var kvp in source)
            {
                target[kvp.Key] = kvp.Value;
            }
        }
        catch 
        { 
            // En producción loguearíamos el error de JSON corrupto
        }
    }
}
