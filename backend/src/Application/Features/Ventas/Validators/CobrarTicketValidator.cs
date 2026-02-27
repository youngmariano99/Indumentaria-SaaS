using Application.DTOs.Ventas;
using FluentValidation;

namespace Application.Features.Ventas.Validators;

public class CobrarTicketValidator : AbstractValidator<CobrarTicketDto>
{
    public CobrarTicketValidator()
    {
        RuleFor(v => v.MetodoPagoId)
            .NotEmpty().WithMessage("El método de pago es obligatorio.");

        RuleFor(v => v.MontoTotalDeclarado)
            .GreaterThanOrEqualTo(0).WithMessage("El total de la venta no puede ser negativo.");

        RuleFor(v => v.Detalles)
            .NotEmpty().WithMessage("El ticket no puede estar vacío.")
            .Must(d => d.Count > 0).WithMessage("Debe enviar por lo menos un ítem a cobrar.");

        RuleForEach(v => v.Detalles).SetValidator(new CobrarTicketDetalleValidator());
    }
}

public class CobrarTicketDetalleValidator : AbstractValidator<CobrarTicketDetalleDto>
{
    public CobrarTicketDetalleValidator()
    {
        RuleFor(d => d.VarianteProductoId)
            .NotEmpty().WithMessage("La variante es obligatoria.");

        RuleFor(d => d.Cantidad)
            .GreaterThan(0).WithMessage("La cantidad a vender debe ser mayor estricto a cero.");

        RuleFor(d => d.PrecioUnitarioDeclarado)
            .GreaterThanOrEqualTo(0).WithMessage("El precio unitario no puede tener valor negativo.");
    }
}
