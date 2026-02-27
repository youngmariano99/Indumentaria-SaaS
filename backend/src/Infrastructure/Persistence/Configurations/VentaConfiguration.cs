using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class VentaConfiguration : IEntityTypeConfiguration<Venta>
{
    public void Configure(EntityTypeBuilder<Venta> builder)
    {
        builder.ToTable("Ventas");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.IdentificadorTicket)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(v => new { v.TenantId, v.IdentificadorTicket })
            .IsUnique();

        builder.Property(v => v.MontoTotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(v => v.Notas)
            .HasMaxLength(500);

        builder.Property(v => v.CAE)
            .HasMaxLength(50);

        // Relaciones
        builder.HasOne(v => v.Inquilino)
            .WithMany()
            .HasForeignKey(v => v.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.Usuario)
            .WithMany()
            .HasForeignKey(v => v.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict); // No borrar al usuario si tiene ventas

        builder.HasOne(v => v.MetodoPago)
            .WithMany()
            .HasForeignKey(v => v.MetodoPagoId)
            .OnDelete(DeleteBehavior.Restrict); // No borrar método de pago si hay ventas consolidadas
            
        builder.HasMany(v => v.Detalles)
            .WithOne(d => d.Venta)
            .HasForeignKey(d => d.VentaId)
            .OnDelete(DeleteBehavior.Cascade); // Si anulan la Venta "entera", borrar los detalles lógicos
    }
}
