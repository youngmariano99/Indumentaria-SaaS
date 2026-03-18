using Application.Common.Interfaces;
using Application.DTOs.Equipo;
using Core.Entities;
using Core.Enums;
using Core.Interfaces.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Equipo.Commands;

/// <summary>
/// Propósito: Registrar un nuevo colaborador en el equipo del negocio.
/// Lógica: 
/// 1. Valida duplicidad de email.
/// 2. Valida el límite de empleados (1 gratis).
/// 3. Hashea la password y guarda.
/// </summary>
public record CrearColaboradorCommand : IRequest<Guid>
{
    public CrearColaboradorRequest Payload { get; init; } = null!;
}

public class CrearColaboradorHandler : IRequestHandler<CrearColaboradorCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CrearColaboradorHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Handle(CrearColaboradorCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Payload;

        // 1. Validar duplicidad global de email (o por tenant si preferís, pero suele ser global)
        // En este SaaS, el email debe ser único por Tenant para permitir el mismo email en distintos rubros si fuera necesario, 
        // pero por simplicidad y seguridad lo buscaremos en todo el sistema.
        _context.EnterBypassMode();
        var existe = await _context.Usuarios.AnyAsync(u => u.Email == dto.Email, cancellationToken);
        if (existe) throw new Exception("El email ya se encuentra registrado en el sistema.");

        // 2. Validar límite de empleados (Sprint 2: Máximo 1 empleado gratis)
        // Contamos cuántos usuarios NO son 'Owner' en este tenant
        var countEmpleados = await _context.Usuarios
            .Where(u => u.Rol != SystemRole.Owner && u.Rol != SystemRole.SuperAdmin)
            .CountAsync(cancellationToken);

        if (countEmpleados >= 1)
        {
            throw new Exception("Has alcanzado el límite de 1 colaborador gratuito. Para agregar más, debés subir de plan.");
        }

        // 3. Crear el usuario
        var nuevoUsuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            PinCodeHash = string.IsNullOrEmpty(dto.Pin) ? null : _passwordHasher.Hash(dto.Pin),
            Rol = dto.Rol,
            FeaturesJson = "{}"
        };

        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync(cancellationToken);

        return nuevoUsuario.Id;
    }
}
