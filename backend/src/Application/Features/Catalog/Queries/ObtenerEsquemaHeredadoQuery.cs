using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Catalog.Queries;

public class ObtenerEsquemaHeredadoQuery : IRequest<string>
{
    public Guid CategoriaId { get; set; }
}

public class ObtenerEsquemaHeredadoQueryHandler : IRequestHandler<ObtenerEsquemaHeredadoQuery, string>
{
    private readonly IApplicationDbContext _dbContext;

    public ObtenerEsquemaHeredadoQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> Handle(ObtenerEsquemaHeredadoQuery request, CancellationToken cancellationToken)
    {
        var atributosConsolidados = new List<dynamic>();
        var idsProcesados = new HashSet<string>();

        var categoriaActualId = (Guid?)request.CategoriaId;

        while (categoriaActualId.HasValue)
        {
            var categoria = await _dbContext.Categorias
                .AsNoTracking()
                .Where(c => c.Id == categoriaActualId)
                .Select(c => new { c.ParentId, c.EsquemaAtributosJson })
                .FirstOrDefaultAsync(cancellationToken);

            if (categoria == null) break;

            if (!string.IsNullOrEmpty(categoria.EsquemaAtributosJson) && categoria.EsquemaAtributosJson != "[]")
            {
                try 
                {
                    var atributos = JsonSerializer.Deserialize<List<JsonElement>>(categoria.EsquemaAtributosJson);
                    if (atributos != null)
                    {
                        foreach (var attr in atributos)
                        {
                            // Evitar duplicados por 'nombre' o 'clave' si el usuario los definió arriba y abajo
                            // Generalmente el esquema es simple: [{"label": "Medida", "id": "Medida", ...}]
                            var id = attr.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
                            var label = attr.TryGetProperty("label", out var labelProp) ? labelProp.GetString() : null;
                            
                            var key = id ?? label;
                            if (key != null && !idsProcesados.Contains(key))
                            {
                                atributosConsolidados.Add(attr);
                                idsProcesados.Add(key);
                            }
                        }
                    }
                }
                catch 
                {
                    // Ignorar errores de parsing en herencia
                }
            }

            categoriaActualId = categoria.ParentId;
        }

        return JsonSerializer.Serialize(atributosConsolidados);
    }
}
