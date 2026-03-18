using Application.Common.Interfaces;
using Application.DTOs.Auth;
using Core.Interfaces.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Core.Exceptions;

namespace Application.Features.Equipo.Commands;

/// <summary>
/// Propósito: Autenticar a un usuario mediante su PIN de 4 dígitos para cambio rápido de turno.
/// </summary>
public record AutenticarPinCommand : IRequest<LoginResponse>
{
    public string Pin { get; init; } = string.Empty;
}

public class AutenticarPinHandler : IRequestHandler<AutenticarPinCommand, LoginResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ITenantResolver _tenantResolver;

    public AutenticarPinHandler(IApplicationDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator, ITenantResolver tenantResolver)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _tenantResolver = tenantResolver;
    }

    public async Task<LoginResponse> Handle(AutenticarPinCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId;
        if (!tenantId.HasValue)
            throw new BusinessException("Contexto de negocio no identificado.");

        // Buscamos usuarios en el tenant actual que tengan PIN configurado
        // Usamos IgnoreQueryFilters para asegurar que vemos a todos los usuarios del tenant (incluyendo Dueño)
        var usuarios = await _context.Usuarios
            .IgnoreQueryFilters()
            .Where(u => u.TenantId == tenantId.Value && !string.IsNullOrEmpty(u.PinCodeHash))
            .ToListAsync(cancellationToken);

        if (!usuarios.Any())
            throw new BusinessException("No hay usuarios con PIN configurado en este negocio.");

        var usuarioValido = usuarios.FirstOrDefault(u => _passwordHasher.Verify(request.Pin, u.PinCodeHash!));

        if (usuarioValido == null)
            throw new BusinessException("PIN incorrecto.");

        return new LoginResponse
        {
            Token = _jwtTokenGenerator.GenerateToken(usuarioValido),
            UserId = usuarioValido.Id,
            Nombre = usuarioValido.Nombre,
            TenantId = usuarioValido.TenantId,
            Rol = usuarioValido.Rol
        };
    }
}
