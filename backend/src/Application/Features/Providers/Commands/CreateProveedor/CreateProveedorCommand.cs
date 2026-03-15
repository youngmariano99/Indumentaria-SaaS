using Application.Common.Interfaces;
using Core.Entities;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Providers.Commands.CreateProveedor;

public class CreateProveedorCommand : IRequest<Guid>
{
    public string RazonSocial { get; set; } = null!;
    public string Documento { get; set; } = null!;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public decimal PorcentajeRecargo { get; set; }
}

public class CreateProveedorCommandHandler : IRequestHandler<CreateProveedorCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateProveedorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProveedorCommand request, CancellationToken cancellationToken)
    {
        var proveedor = new Proveedor
        {
            Id = Guid.NewGuid(),
            RazonSocial = request.RazonSocial,
            Cuit = request.Documento,
            Email = request.Email ?? string.Empty,
            Telefono = request.Telefono ?? string.Empty,
            Direccion = request.Direccion ?? string.Empty,
            Saldo = 0,
            PorcentajeRecargo = request.PorcentajeRecargo
        };

        _context.Proveedores.Add(proveedor);
        await _context.SaveChangesAsync(cancellationToken);

        return proveedor.Id;
    }
}
