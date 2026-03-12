using Core.Interfaces;
using Infrastructure.Verticals;
using System.Collections.Generic;
using System.Linq;

namespace Infrastructure.Services;

public interface IVerticalRulesFactory
{
    IVerticalRules GetRules(string slug);
}

public class VerticalRulesFactory : IVerticalRulesFactory
{
    private readonly IEnumerable<IVerticalRules> _rules;

    public VerticalRulesFactory(IEnumerable<IVerticalRules> rules)
    {
        _rules = rules;
    }

    public IVerticalRules GetRules(string slug)
    {
        return _rules.FirstOrDefault(r => r.RubroSlug == (slug ?? "indumentaria").ToLower()) 
               ?? _rules.First(r => r.RubroSlug == "indumentaria");
    }
}
