using Application.Common.Interfaces;
using Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Catalog.Queries;

public class ObtenerCategoriasQuery : IRequest<List<CategoriaDto>> { }

public class ObtenerCategoriasQueryHandler : IRequestHandler<ObtenerCategoriasQuery, List<CategoriaDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public ObtenerCategoriasQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CategoriaDto>> Handle(ObtenerCategoriasQuery request, CancellationToken cancellationToken)
    {
        var categorias = await _dbContext.Categorias
            .OrderBy(c => c.Nombre)
            .ToListAsync(cancellationToken);

        // Mapear entidades a DTOs
        var dtos = categorias.Select(c => new CategoriaDto
        {
            Id = c.Id,
            Nombre = c.Nombre,
            Descripcion = c.Descripcion,
            CodigoNcm = c.Ncm,
            ParentCategoryId = c.ParentId
        }).ToList();

        // Construir el árbol en memoria
        return ConstruirArbol(dtos);
    }

    private List<CategoriaDto> ConstruirArbol(List<CategoriaDto> todasLasCategorias)
    {
        var dict = todasLasCategorias.ToDictionary(c => c.Id);
        var raices = new List<CategoriaDto>();

        foreach (var c in todasLasCategorias)
        {
            if (c.ParentCategoryId.HasValue && dict.TryGetValue(c.ParentCategoryId.Value, out var parent))
            {
                parent.Subcategorias.Add(c);
            }
            else
            {
                raices.Add(c); // Es nodo raíz si ParentCategoryId es null o no se encontró el padre
            }
        }

        return raices.OrderBy(r => r.Nombre).ToList();
    }
}
