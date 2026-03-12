using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class AtributoConfiguracionConfiguration : IEntityTypeConfiguration<AtributoConfiguracion>
{
    public void Configure(EntityTypeBuilder<AtributoConfiguracion> builder)
    {
        builder.ToTable("AtributosConfiguracion");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Grupo)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Valor)
            .IsRequired()
            .HasMaxLength(150);

        // Índice compuesto rápido para búsquedas por Tenant y Grupo
        builder.HasIndex(e => new { e.TenantId, e.Grupo });

        // Un mismo valor no puede repetirse dentro de un grupo para el mismo tenant
        builder.HasIndex(e => new { e.TenantId, e.Grupo, e.Valor })
            .IsUnique();
    }
}
