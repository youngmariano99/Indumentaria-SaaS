using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArqueoCaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ArqueosCaja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaApertura = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SaldoInicial = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalVentasEsperado = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalManualEsperado = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalRealContado = table.Column<decimal>(type: "numeric", nullable: false),
                    Diferencia = table.Column<decimal>(type: "numeric", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArqueosCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArqueosCaja_Sucursales_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArqueosCaja_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ArqueosCajaDetalle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArqueoCajaId = table.Column<Guid>(type: "uuid", nullable: false),
                    MetodoPagoId = table.Column<Guid>(type: "uuid", nullable: false),
                    MontoEsperado = table.Column<decimal>(type: "numeric", nullable: false),
                    MontoReal = table.Column<decimal>(type: "numeric", nullable: false),
                    Diferencia = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArqueosCajaDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArqueosCajaDetalle_ArqueosCaja_ArqueoCajaId",
                        column: x => x.ArqueoCajaId,
                        principalTable: "ArqueosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArqueosCajaDetalle_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCaja_StoreId",
                table: "ArqueosCaja",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCaja_UsuarioId",
                table: "ArqueosCaja",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCajaDetalle_ArqueoCajaId",
                table: "ArqueosCajaDetalle",
                column: "ArqueoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCajaDetalle_MetodoPagoId",
                table: "ArqueosCajaDetalle",
                column: "MetodoPagoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArqueosCajaDetalle");

            migrationBuilder.DropTable(
                name: "ArqueosCaja");
        }
    }
}
