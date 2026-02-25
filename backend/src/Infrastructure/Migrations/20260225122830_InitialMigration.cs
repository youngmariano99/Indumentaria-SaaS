using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BilleterasVirtuales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SaldoActual = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BilleterasVirtuales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CertificadosDigitales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    KeyVaultReference = table.Column<string>(type: "text", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificadosDigitales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Documento = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PreferenciasJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Comprobantes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    CAE = table.Column<string>(type: "text", nullable: true),
                    VencimientoCAE = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalNeto = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalIva = table.Column<decimal>(type: "numeric", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comprobantes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Inquilinos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NombreComercial = table.Column<string>(type: "text", nullable: false),
                    CUIT = table.Column<string>(type: "text", nullable: false),
                    ConfiguracionRegional = table.Column<string>(type: "text", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inquilinos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Inventarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductVariantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StockActual = table.Column<int>(type: "integer", nullable: false),
                    StockMinimo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LogsAuditoria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TableName = table.Column<string>(type: "text", nullable: false),
                    PrimaryKey = table.Column<string>(type: "text", nullable: true),
                    Action = table.Column<string>(type: "text", nullable: false),
                    OldValues = table.Column<string>(type: "jsonb", nullable: true),
                    NewValues = table.Column<string>(type: "jsonb", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogsAuditoria", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LogsFiscales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Accion = table.Column<int>(type: "integer", nullable: false),
                    RequestJson = table.Column<string>(type: "jsonb", nullable: true),
                    ResponseJson = table.Column<string>(type: "jsonb", nullable: true),
                    Exitoso = table.Column<bool>(type: "boolean", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogsFiscales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModulosSuscripcion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuloKey = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModulosSuscripcion", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    PrecioBase = table.Column<decimal>(type: "numeric", nullable: false),
                    CategoriaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Temporada = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sucursales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    EsDepositoCentral = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sucursales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TelemetriasUso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Metrica = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Mes = table.Column<int>(type: "integer", nullable: false),
                    Año = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TelemetriasUso", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransaccionesBilleteras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BilleteraVirtualId = table.Column<Guid>(type: "uuid", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    ComprobanteId = table.Column<Guid>(type: "uuid", nullable: true),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransaccionesBilleteras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    PinCodeHash = table.Column<string>(type: "text", nullable: true),
                    Rol = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VariantesProducto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Talle = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    SKU = table.Column<string>(type: "text", nullable: false),
                    PrecioOverride = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariantesProducto", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ItemsComprobante",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ComprobanteId = table.Column<Guid>(type: "uuid", nullable: false),
                    VarianteProductoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    IvaAlicuota = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemsComprobante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemsComprobante_Comprobantes_ComprobanteId",
                        column: x => x.ComprobanteId,
                        principalTable: "Comprobantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemsComprobante_ComprobanteId",
                table: "ItemsComprobante",
                column: "ComprobanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_TenantId",
                table: "Usuarios",
                column: "TenantId");
        
            // ==========================================
            // SPRINT 2: HABILITACIÓN ROW LEVEL SECURITY
            // ==========================================
            // Eliminamos "Inquilinos" ya que es la tabla maestra y no tiene TenantId por definición
            // Eliminamos "ItemsComprobante" ya que aisla su tenancy mediante la FK del "Comprobante" padre
            // Eliminamos "TransaccionesBilleteras" ya que aisla su tenancy mediante la FK de la "BilleteraVirtual" padre
            var rlsTables = new[] { 
                "BilleterasVirtuales", "CertificadosDigitales", "Clientes", "Comprobantes", 
                "Inventarios", "LogsAuditoria", 
                "LogsFiscales", "ModulosSuscripcion", "Productos", "Sucursales", 
                "TelemetriasUso", "Usuarios", "VariantesProducto"
            };

            foreach(var table in rlsTables)
            {
                // 1. Forzar RLS en la tabla
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" ENABLE ROW LEVEL SECURITY;");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" FORCE ROW LEVEL SECURITY;");
                
                // 2. Crear una política universal que filtre by tenant a partir de la variable de sesión
                // Para que el RLS funcione, la DB debe estar seteada por la App con "set-config" en cada scope de request
                migrationBuilder.Sql($@"
                    CREATE POLICY tenant_isolation_policy ON ""{table}""
                    USING (""TenantId"" = current_setting('app.current_tenant', true)::uuid);
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var rlsTables = new[] { 
                "BilleterasVirtuales", "CertificadosDigitales", "Clientes", "Comprobantes", 
                "Inventarios", "LogsAuditoria", 
                "LogsFiscales", "ModulosSuscripcion", "Productos", "Sucursales", 
                "TelemetriasUso", "Usuarios", "VariantesProducto"
            };

            foreach(var table in rlsTables)
            {
                migrationBuilder.Sql($@"DROP POLICY IF EXISTS tenant_isolation_policy ON ""{table}"";");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" DISABLE ROW LEVEL SECURITY;");
            }

            migrationBuilder.DropTable(
                name: "BilleterasVirtuales");

            migrationBuilder.DropTable(
                name: "CertificadosDigitales");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "Inquilinos");

            migrationBuilder.DropTable(
                name: "Inventarios");

            migrationBuilder.DropTable(
                name: "ItemsComprobante");

            migrationBuilder.DropTable(
                name: "LogsAuditoria");

            migrationBuilder.DropTable(
                name: "LogsFiscales");

            migrationBuilder.DropTable(
                name: "ModulosSuscripcion");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropTable(
                name: "Sucursales");

            migrationBuilder.DropTable(
                name: "TelemetriasUso");

            migrationBuilder.DropTable(
                name: "TransaccionesBilleteras");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "VariantesProducto");

            migrationBuilder.DropTable(
                name: "Comprobantes");
        }
    }
}
