using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRubroEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RubroId",
                table: "Inquilinos",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Rubros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Icono = table.Column<string>(type: "text", nullable: false),
                    DiccionarioJson = table.Column<string>(type: "jsonb", nullable: false),
                    EsquemaMetadatosJson = table.Column<string>(type: "jsonb", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rubros", x => x.Id);
                });

            // Seed Rubro Indumentaria for retrocompatibility
            var indumentariaId = new Guid("d1e0f6a2-1234-5678-90ab-cdef01234567");
            migrationBuilder.InsertData(
                table: "Rubros",
                columns: new[] { "Id", "Nombre", "Icono", "DiccionarioJson", "EsquemaMetadatosJson", "Activo" },
                values: new object[] { indumentariaId, "Indumentaria", "👕", "{\"Producto\": \"Prenda\", \"Talle\": \"Talle\", \"Color\": \"Color\", \"Variante\": \"Variante\"}", "{}", true }
            );

            // Assign all existing tenants to Indumentaria rubro
            migrationBuilder.Sql($"UPDATE \"Inquilinos\" SET \"RubroId\" = '{indumentariaId}'");

            migrationBuilder.CreateIndex(
                name: "IX_Inquilinos_RubroId",
                table: "Inquilinos",
                column: "RubroId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inquilinos_Rubros_RubroId",
                table: "Inquilinos",
                column: "RubroId",
                principalTable: "Rubros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inquilinos_Rubros_RubroId",
                table: "Inquilinos");

            migrationBuilder.DropTable(
                name: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Inquilinos_RubroId",
                table: "Inquilinos");

            migrationBuilder.DropColumn(
                name: "RubroId",
                table: "Inquilinos");
        }
    }
}
