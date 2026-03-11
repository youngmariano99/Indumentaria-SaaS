using FluentValidation;
using Application.DTOs.Auth;

namespace Application.Features.Auth.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.NombreComercial)
            .NotEmpty().WithMessage("El nombre del negocio es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Subdominio)
            .NotEmpty().WithMessage("El subdominio es obligatorio.")
            .Matches("^[a-z0-9-]+$").WithMessage("El subdominio solo puede contener letras minúsculas, números y guiones.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.");
    }
}
