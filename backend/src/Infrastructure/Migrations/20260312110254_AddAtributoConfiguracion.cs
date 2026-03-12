using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAtributoConfiguracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AtributosConfiguracion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Grupo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Valor = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AtributosConfiguracion", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AtributosConfiguracion_TenantId_Grupo",
                table: "AtributosConfiguracion",
                columns: new[] { "TenantId", "Grupo" });

            migrationBuilder.CreateIndex(
                name: "IX_AtributosConfiguracion_TenantId_Grupo_Valor",
                table: "AtributosConfiguracion",
                columns: new[] { "TenantId", "Grupo", "Valor" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AtributosConfiguracion");
        }
    }
}
