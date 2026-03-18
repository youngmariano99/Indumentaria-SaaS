using Application.Common.Interfaces;
using Core.Interfaces.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Equipo.Commands;

public record CambiarPinCommand : IRequest<bool>
{
    public Guid UsuarioId { get; init; }
    public string NuevoPin { get; init; } = string.Empty;
}

public class CambiarPinHandler : IRequestHandler<CambiarPinCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CambiarPinHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(CambiarPinCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken);

        if (usuario == null) return false;

        if (request.NuevoPin.Length != 4) 
            throw new Exception("El PIN debe tener exactamente 4 dígitos.");

        usuario.PinCodeHash = _passwordHasher.Hash(request.NuevoPin);
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
