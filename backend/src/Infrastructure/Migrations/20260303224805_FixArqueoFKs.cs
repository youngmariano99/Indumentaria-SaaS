using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixArqueoFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ArqueosCaja_Sucursales_StoreId",
                table: "ArqueosCaja");

            migrationBuilder.DropForeignKey(
                name: "FK_ArqueosCaja_Usuarios_UsuarioId",
                table: "ArqueosCaja");

            migrationBuilder.DropIndex(
                name: "IX_ArqueosCaja_StoreId",
                table: "ArqueosCaja");

            migrationBuilder.DropIndex(
                name: "IX_ArqueosCaja_UsuarioId",
                table: "ArqueosCaja");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCaja_StoreId",
                table: "ArqueosCaja",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCaja_UsuarioId",
                table: "ArqueosCaja",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_ArqueosCaja_Sucursales_StoreId",
                table: "ArqueosCaja",
                column: "StoreId",
                principalTable: "Sucursales",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ArqueosCaja_Usuarios_UsuarioId",
                table: "ArqueosCaja",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
