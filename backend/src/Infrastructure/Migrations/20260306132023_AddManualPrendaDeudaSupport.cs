using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddManualPrendaDeudaSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrendasClientesEnCurso_VariantesProducto_VarianteProductoId",
                table: "PrendasClientesEnCurso");

            migrationBuilder.AlterColumn<Guid>(
                name: "VarianteProductoId",
                table: "PrendasClientesEnCurso",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "ProductoManualNombre",
                table: "PrendasClientesEnCurso",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VarianteManualNombre",
                table: "PrendasClientesEnCurso",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PrendasClientesEnCurso_VariantesProducto_VarianteProductoId",
                table: "PrendasClientesEnCurso",
                column: "VarianteProductoId",
                principalTable: "VariantesProducto",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrendasClientesEnCurso_VariantesProducto_VarianteProductoId",
                table: "PrendasClientesEnCurso");

            migrationBuilder.DropColumn(
                name: "ProductoManualNombre",
                table: "PrendasClientesEnCurso");

            migrationBuilder.DropColumn(
                name: "VarianteManualNombre",
                table: "PrendasClientesEnCurso");

            migrationBuilder.AlterColumn<Guid>(
                name: "VarianteProductoId",
                table: "PrendasClientesEnCurso",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PrendasClientesEnCurso_VariantesProducto_VarianteProductoId",
                table: "PrendasClientesEnCurso",
                column: "VarianteProductoId",
                principalTable: "VariantesProducto",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
