using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class VentaDetalleConfiguration : IEntityTypeConfiguration<VentaDetalle>
{
    public void Configure(EntityTypeBuilder<VentaDetalle> builder)
    {
        builder.ToTable("VentasDetalles");

        builder.HasKey(d => d.Id);

        // Cláusulas de inmutabilidad financiera
        builder.Property(d => d.PrecioUnitarioAplicado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(d => d.SubtotalLinea)
            .HasPrecision(18, 2)
            .IsRequired();
            
        builder.Property(d => d.Cantidad)
            .IsRequired();

        // Relaciones
        builder.HasOne(d => d.Venta)
            .WithMany(v => v.Detalles)
            .HasForeignKey(d => d.VentaId)
            .OnDelete(DeleteBehavior.Cascade); // Si borran la Cabecera, que caiga el detalle

        builder.HasOne(d => d.VarianteProducto)
            .WithMany()
            .HasForeignKey(d => d.VarianteProductoId)
            // ESTA ES LA REGLA DE ORO DE CAJA: Si existe venta, NO puede borrarse el stock base
            .OnDelete(DeleteBehavior.Restrict);
    }
}
