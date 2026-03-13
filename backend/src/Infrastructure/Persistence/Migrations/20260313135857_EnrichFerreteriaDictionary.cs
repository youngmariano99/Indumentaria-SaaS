using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnrichFerreteriaDictionary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var dictionaryJson = "{\"Talle\": \"Medida\", \"Talles\": \"Medidas\", \"Color\": \"Material\", \"Colores\": \"Materiales\", \"Temporada\": \"Línea/Colección\", \"Producto\": \"Artículo\", \"Variantes\": \"Combinaciones\", \"Catalogo\": \"Inventario Técnico\"}";
            
            migrationBuilder.Sql($@"
                UPDATE ""Rubros"" 
                SET ""DiccionarioJson"" = '{dictionaryJson}'
                WHERE ""Slug"" = 'ferreteria';
            ");

            // También podemos poner iconos técnicos
            migrationBuilder.Sql(@"
                UPDATE ""Rubros""
                SET ""Icono"" = 'Wrench'
                WHERE ""Slug"" = 'ferreteria';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
