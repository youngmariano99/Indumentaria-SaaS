using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Features.Auth.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es requerido.")
            .EmailAddress().WithMessage("El formato del correo es inválido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida.");

        RuleFor(x => x.Subdominio)
            .NotEmpty().WithMessage("El subdominio de la tienda es requerido.");
    }
}
