using Application.Common.Interfaces;
using Application.Features.CRM.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public class EditarClienteCommand : IRequest<ClienteDto>
{
    public EditarClienteDto Cliente { get; set; } = null!;
}

public class EditarClienteCommandHandler : IRequestHandler<EditarClienteCommand, ClienteDto>
{
    private readonly IApplicationDbContext _context;

    public EditarClienteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ClienteDto> Handle(EditarClienteCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == request.Cliente.Id && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"No se encontró el cliente con ID {request.Cliente.Id}.");

        // Validar colisión de documento en otro cliente si cambia el documento
        if (!string.IsNullOrWhiteSpace(request.Cliente.Documento) && request.Cliente.Documento != entity.Documento)
        {
             var existe = await _context.Clientes
                .AnyAsync(c => c.Documento == request.Cliente.Documento 
                            && c.Id != entity.Id 
                            && !c.IsDeleted, cancellationToken);
             if (existe)
                throw new InvalidOperationException($"Ya existe otro cliente con el documento '{request.Cliente.Documento}'.");
        }

        entity.Documento = request.Cliente.Documento;
        entity.Nombre = request.Cliente.Nombre;
        entity.Email = request.Cliente.Email;
        entity.Telefono = request.Cliente.Telefono;
        entity.Direccion = request.Cliente.Direccion;
        entity.CondicionIva = request.Cliente.CondicionIva;
        entity.PreferenciasJson = request.Cliente.PreferenciasJson;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClienteDto
        {
            Id = entity.Id,
            Documento = entity.Documento,
            Nombre = entity.Nombre,
            Email = entity.Email,
            Telefono = entity.Telefono,
            Direccion = entity.Direccion,
            CondicionIva = entity.CondicionIva,
            PreferenciasJson = entity.PreferenciasJson
        };
    }
}
