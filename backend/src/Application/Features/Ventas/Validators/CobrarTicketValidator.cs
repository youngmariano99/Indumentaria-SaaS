using Application.DTOs.Ventas;
using Application.Features.Ventas.Commands;
using FluentValidation;

namespace Application.Features.Ventas.Validators;

/// <summary>
/// Validator conectado al Pipeline de MediatR — valida el COMMAND, no sólo el DTO.
/// </summary>
public class CobrarTicketCommandValidator : AbstractValidator<CobrarTicketCommand>
{
    public CobrarTicketCommandValidator()
    {
        RuleFor(c => c.Payload.MetodoPagoId)
            .NotEmpty().WithMessage("El método de pago es obligatorio.");

        RuleFor(c => c.Payload.MontoTotalDeclarado)
            .GreaterThanOrEqualTo(0).WithMessage("El total de la venta no puede ser negativo.");

        RuleFor(c => c.Payload.Detalles)
            .NotEmpty().WithMessage("El ticket no puede estar vacío.");

        RuleForEach(c => c.Payload.Detalles).SetValidator(new CobrarTicketDetalleValidator());
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
