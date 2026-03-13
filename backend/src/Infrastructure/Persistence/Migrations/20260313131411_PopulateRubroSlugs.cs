using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PopulateRubroSlugs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Rubros\" SET \"Slug\" = 'indumentaria' WHERE \"Nombre\" ILIKE '%indumentaria%' AND (\"Slug\" IS NULL OR \"Slug\" = '');");
            migrationBuilder.Sql("UPDATE \"Rubros\" SET \"Slug\" = 'ferreteria' WHERE \"Nombre\" ILIKE '%ferreteria%' AND (\"Slug\" IS NULL OR \"Slug\" = '');");
            
            // Si el rubro Indumentaria no existe con ese ID específico, lo creamos
            migrationBuilder.Sql(@"
                INSERT INTO ""Rubros"" (""Id"", ""Nombre"", ""Slug"", ""Activo"", ""Icono"", ""DiccionarioJson"", ""EsquemaMetadatosJson"", ""FeaturesJson"")
                SELECT 'd1e0f6a2-1234-5678-90ab-cdef01234567', 'Indumentaria', 'indumentaria', true, 'Tshirt', '{}', '{}', '{}'
                WHERE NOT EXISTS (SELECT 1 FROM ""Rubros"" WHERE ""Slug"" = 'indumentaria');
            ");
            
            // Si el rubro Ferreteria no existe, lo creamos
            migrationBuilder.Sql(@"
                INSERT INTO ""Rubros"" (""Id"", ""Nombre"", ""Slug"", ""Activo"", ""Icono"", ""DiccionarioJson"", ""EsquemaMetadatosJson"", ""FeaturesJson"")
                SELECT gen_random_uuid(), 'Ferreteria', 'ferreteria', true, 'Wrench', '{}', '{}', '{}'
                WHERE NOT EXISTS (SELECT 1 FROM ""Rubros"" WHERE ""Slug"" = 'ferreteria');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
