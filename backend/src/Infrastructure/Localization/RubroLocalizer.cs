using System.Collections.Generic;
using System.Text.Json;
using Microsoft.Extensions.Localization;
using Core.Interfaces;

namespace Infrastructure.Localization;

/// <summary>
/// Motor de localización dinámico basado en Rubros.
/// Intercepta las claves de traducción y las busca en el diccionario JSON del inquilino actual.
/// </summary>
public class RubroLocalizer : IStringLocalizer
{
    private readonly ITenantResolver _tenantResolver;
    private Dictionary<string, string> _diccionario;

    public RubroLocalizer(ITenantResolver tenantResolver)
    {
        _tenantResolver = tenantResolver;
        _diccionario = LoadDictionary();
    }

    private Dictionary<string, string> LoadDictionary()
    {
        var json = _tenantResolver.DiccionarioJson;
        if (string.IsNullOrEmpty(json)) return new Dictionary<string, string>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new Dictionary<string, string>();
        }
        catch
        {
            return new Dictionary<string, string>();
        }
    }

    public LocalizedString this[string name]
    {
        get
        {
            var translation = _diccionario.GetValueOrDefault(name, name);
            return new LocalizedString(name, translation);
        }
    }

    public LocalizedString this[string name, params object[] arguments]
    {
        get
        {
            var translation = _diccionario.GetValueOrDefault(name, name);
            return new LocalizedString(name, string.Format(translation, arguments));
        }
    }

    public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
    {
        foreach (var item in _diccionario)
        {
            yield return new LocalizedString(item.Key, item.Value);
        }
    }
}
