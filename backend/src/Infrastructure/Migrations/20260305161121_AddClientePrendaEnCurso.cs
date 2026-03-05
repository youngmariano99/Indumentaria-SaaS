using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientePrendaEnCurso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PrendasClientesEnCurso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    VarianteProductoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioReferencia = table.Column<decimal>(type: "numeric", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrendasClientesEnCurso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrendasClientesEnCurso_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrendasClientesEnCurso_VariantesProducto_VarianteProductoId",
                        column: x => x.VarianteProductoId,
                        principalTable: "VariantesProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrendasClientesEnCurso_ClienteId",
                table: "PrendasClientesEnCurso",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendasClientesEnCurso_VarianteProductoId",
                table: "PrendasClientesEnCurso",
                column: "VarianteProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrendasClientesEnCurso");
        }
    }
}
