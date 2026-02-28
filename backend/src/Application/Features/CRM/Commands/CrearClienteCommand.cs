using Application.Common.Interfaces;
using Application.Features.CRM.DTOs;
using Core.Entities;
using Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.CRM.Commands;

public class CrearClienteCommand : IRequest<ClienteDto>
{
    public CrearClienteDto Cliente { get; set; } = null!;
}

public class CrearClienteCommandHandler : IRequestHandler<CrearClienteCommand, ClienteDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantResolver _tenantResolver;

    public CrearClienteCommandHandler(
        IApplicationDbContext context,
        ITenantResolver tenantResolver)
    {
        _context = context;
        _tenantResolver = tenantResolver;
    }

    public async Task<ClienteDto> Handle(CrearClienteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantResolver.TenantId 
            ?? throw new UnauthorizedAccessException("Tenant no identificado");

        // Validar documento (opcionalmente) si no está en blanco
        if (!string.IsNullOrWhiteSpace(request.Cliente.Documento))
        {
            var existe = await _context.Clientes
                .AnyAsync(c => c.Documento == request.Cliente.Documento 
                            && c.TenantId == tenantId 
                            && !c.IsDeleted, cancellationToken);
            if (existe)
                throw new InvalidOperationException($"Ya existe un cliente con el documento '{request.Cliente.Documento}'.");
        }

        var entity = new Cliente
        {
            TenantId = tenantId,
            Documento = request.Cliente.Documento,
            Nombre = request.Cliente.Nombre,
            Email = request.Cliente.Email,
            Telefono = request.Cliente.Telefono,
            Direccion = request.Cliente.Direccion,
            CondicionIva = request.Cliente.CondicionIva,
            PreferenciasJson = request.Cliente.PreferenciasJson
        };

        _context.Clientes.Add(entity);
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
