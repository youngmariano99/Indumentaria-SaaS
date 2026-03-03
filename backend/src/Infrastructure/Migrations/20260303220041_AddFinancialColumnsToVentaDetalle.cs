using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialColumnsToVentaDetalle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AlicuotaIvaPct",
                table: "VentasDetalles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CostoUnitarioAplicado",
                table: "VentasDetalles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoIvaTotal",
                table: "VentasDetalles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "MetodoPagoId",
                table: "MovimientosSaldosClientes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosSaldosClientes_MetodoPagoId",
                table: "MovimientosSaldosClientes",
                column: "MetodoPagoId");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosSaldosClientes_MetodosPago_MetodoPagoId",
                table: "MovimientosSaldosClientes",
                column: "MetodoPagoId",
                principalTable: "MetodosPago",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosSaldosClientes_MetodosPago_MetodoPagoId",
                table: "MovimientosSaldosClientes");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosSaldosClientes_MetodoPagoId",
                table: "MovimientosSaldosClientes");

            migrationBuilder.DropColumn(
                name: "AlicuotaIvaPct",
                table: "VentasDetalles");

            migrationBuilder.DropColumn(
                name: "CostoUnitarioAplicado",
                table: "VentasDetalles");

            migrationBuilder.DropColumn(
                name: "MontoIvaTotal",
                table: "VentasDetalles");

            migrationBuilder.DropColumn(
                name: "MetodoPagoId",
                table: "MovimientosSaldosClientes");
        }
    }
}
