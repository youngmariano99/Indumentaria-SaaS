using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddModuloProveedores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Proveedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RazonSocial = table.Column<string>(type: "text", nullable: false),
                    NombreFantasia = table.Column<string>(type: "text", nullable: false),
                    Cuit = table.Column<string>(type: "text", nullable: false),
                    CondicionIva = table.Column<int>(type: "integer", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Saldo = table.Column<decimal>(type: "numeric", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proveedores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FacturasProveedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumeroFactura = table.Column<string>(type: "text", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaVencimiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MontoTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    SaldoPendiente = table.Column<decimal>(type: "numeric", nullable: false),
                    Origen = table.Column<int>(type: "integer", nullable: false),
                    DocumentoUrl = table.Column<string>(type: "text", nullable: true),
                    MetadatosRawJsonb = table.Column<string>(type: "jsonb", nullable: true),
                    EstadoProcesamiento = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturasProveedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FacturasProveedores_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PagosProveedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MontoTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    Notas = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    MetodoPagoId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagosProveedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagosProveedores_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PagosProveedores_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProveedoresProductos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uuid", nullable: false),
                    VendorSku = table.Column<string>(type: "text", nullable: false),
                    Costo = table.Column<decimal>(type: "numeric", nullable: false),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProveedoresProductos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProveedoresProductos_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProveedoresProductos_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChequesTerceros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NumeroCheque = table.Column<string>(type: "text", nullable: false),
                    Banco = table.Column<string>(type: "text", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaCobro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Importe = table.Column<decimal>(type: "numeric", nullable: false),
                    Emisor = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    PagoProveedorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChequesTerceros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChequesTerceros_PagosProveedores_PagoProveedorId",
                        column: x => x.PagoProveedorId,
                        principalTable: "PagosProveedores",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DistribucionesPagosFacturas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    PagoProveedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    FacturaProveedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    MontoAsignado = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistribucionesPagosFacturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DistribucionesPagosFacturas_FacturasProveedores_FacturaProv~",
                        column: x => x.FacturaProveedorId,
                        principalTable: "FacturasProveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DistribucionesPagosFacturas_PagosProveedores_PagoProveedorId",
                        column: x => x.PagoProveedorId,
                        principalTable: "PagosProveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChequesTerceros_PagoProveedorId",
                table: "ChequesTerceros",
                column: "PagoProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_DistribucionesPagosFacturas_FacturaProveedorId",
                table: "DistribucionesPagosFacturas",
                column: "FacturaProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_DistribucionesPagosFacturas_PagoProveedorId",
                table: "DistribucionesPagosFacturas",
                column: "PagoProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturasProveedores_MetadatosRawJsonb",
                table: "FacturasProveedores",
                column: "MetadatosRawJsonb")
                .Annotation("Npgsql:IndexMethod", "gin");

            migrationBuilder.CreateIndex(
                name: "IX_FacturasProveedores_ProveedorId",
                table: "FacturasProveedores",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosProveedores_MetodoPagoId",
                table: "PagosProveedores",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosProveedores_ProveedorId",
                table: "PagosProveedores",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProveedoresProductos_ProductoId",
                table: "ProveedoresProductos",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProveedoresProductos_ProveedorId",
                table: "ProveedoresProductos",
                column: "ProveedorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChequesTerceros");

            migrationBuilder.DropTable(
                name: "DistribucionesPagosFacturas");

            migrationBuilder.DropTable(
                name: "ProveedoresProductos");

            migrationBuilder.DropTable(
                name: "FacturasProveedores");

            migrationBuilder.DropTable(
                name: "PagosProveedores");

            migrationBuilder.DropTable(
                name: "Proveedores");
        }
    }
}
