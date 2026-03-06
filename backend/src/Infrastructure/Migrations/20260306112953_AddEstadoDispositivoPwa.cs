using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEstadoDispositivoPwa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DeudaOrigenId",
                table: "MovimientosSaldosClientes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EstadosDispositivosPwa",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DispositivoId = table.Column<string>(type: "text", nullable: false),
                    NombreDispositivo = table.Column<string>(type: "text", nullable: false),
                    AppVersion = table.Column<string>(type: "text", nullable: false),
                    UltimaVezOnline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ItemsPendientesSubida = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosDispositivosPwa", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstadosDispositivosPwa");

            migrationBuilder.DropColumn(
                name: "DeudaOrigenId",
                table: "MovimientosSaldosClientes");
        }
    }
}
