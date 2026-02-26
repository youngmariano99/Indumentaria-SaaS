using Application.DTOs.Catalog;
using FluentValidation;

namespace Application.Features.Catalog.Validators;

public class VarianteValidator : AbstractValidator<VarianteDto>
{
    public VarianteValidator()
    {
        RuleFor(v => v.Talle)
            .NotEmpty().WithMessage("El talle es obligatorio.");
            
        RuleFor(v => v.Color)
            .NotEmpty().WithMessage("El color es obligatorio.");

        RuleFor(v => v.PrecioCosto)
            .GreaterThanOrEqualTo(0).WithMessage("El precio de costo no puede ser negativo.");
            
        RuleFor(v => v.PrecioOverride)
            .GreaterThan(0).When(v => v.PrecioOverride.HasValue)
            .WithMessage("Si se especifica un precio especial para la variante, debe ser mayor a 0.");
    }
}

public class CrearProductoValidator : AbstractValidator<CrearProductoDto>
{
    public CrearProductoValidator()
    {
        RuleFor(p => p.Nombre)
            .NotEmpty().WithMessage("El nombre del producto es obligatorio.")
            .MaximumLength(150).WithMessage("El nombre no debe superar los 150 caracteres.");

        RuleFor(p => p.PrecioBase)
            .GreaterThan(0).WithMessage("El precio base debe ser mayor a 0.");

        RuleFor(p => p.CategoriaId)
            .NotEmpty().WithMessage("Debe asignar una categoría al producto.");

        RuleForEach(p => p.Variantes)
            .SetValidator(new VarianteValidator());
            
        // Regla cruzada: Evitar variantes duplicadas exacta (Mismo talle y color)
        RuleFor(p => p.Variantes)
            .Must(variantes => 
            {
                if (variantes == null) return true;
                
                var combinacionesUnicas = variantes
                    .Select(v => $"{v.Talle.Trim().ToLowerInvariant()}-{v.Color.Trim().ToLowerInvariant()}")
                    .Distinct()
                    .Count();
                    
                return combinacionesUnicas == variantes.Count;
            })
            .WithMessage("La matriz contiene variantes duplicadas (Mismo Talle y Color).");
    }
}

public class CrearProductoConVariantesCommandValidator : AbstractValidator<Application.Features.Catalog.Commands.CrearProductoConVariantesCommand>
{
    public CrearProductoConVariantesCommandValidator()
    {
        RuleFor(cmd => cmd.Payload)
            .SetValidator(new CrearProductoValidator());
    }
}
