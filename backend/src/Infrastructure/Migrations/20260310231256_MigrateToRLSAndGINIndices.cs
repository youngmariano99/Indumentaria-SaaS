using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MigrateToRLSAndGINIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MetadatosJson",
                table: "Productos",
                type: "jsonb",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.Sql(@"
                UPDATE ""VariantesProducto"" SET ""AtributosJson"" = '{}' WHERE ""AtributosJson"" = '' OR ""AtributosJson"" IS NULL;
                ALTER TABLE ""VariantesProducto"" ALTER COLUMN ""AtributosJson"" DROP DEFAULT;
                ALTER TABLE ""VariantesProducto"" ALTER COLUMN ""AtributosJson"" TYPE jsonb USING ""AtributosJson""::jsonb;
                ALTER TABLE ""VariantesProducto"" ALTER COLUMN ""AtributosJson"" SET DEFAULT '{}';
            ");

            migrationBuilder.CreateIndex(
                name: "IX_VariantesProducto_AtributosJson",
                table: "VariantesProducto",
                column: "AtributosJson")
                .Annotation("Npgsql:IndexMethod", "gin");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_MetadatosJson",
                table: "Productos",
                column: "MetadatosJson")
                .Annotation("Npgsql:IndexMethod", "gin");

            // RLS Implementation for all Tenant-based tables
            var tables = new[] 
            { 
                "Categorias", "Productos", "VariantesProducto", "Inventarios", 
                "Clientes", "Ventas", "VentasDetalles", "MetodosPago",
                "ArqueosCaja", "ArqueosCajaDetalle", "EstadosDispositivosPwa",
                "Comprobantes", "Sucursales", "Usuarios"
            };

            foreach (var table in tables)
            {
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" ENABLE ROW LEVEL SECURITY;");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" FORCE ROW LEVEL SECURITY;");
                migrationBuilder.Sql($@"DROP POLICY IF EXISTS tenant_isolation_policy ON ""{table}"";");
                migrationBuilder.Sql($@"
                    CREATE POLICY tenant_isolation_policy ON ""{table}""
                    USING (""TenantId"" = current_setting('app.current_tenant', true)::uuid);
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var tables = new[] 
            { 
                "Categorias", "Productos", "VariantesProducto", "Inventarios", 
                "Clientes", "Ventas", "VentasDetalles", "MetodosPago",
                "ArqueosCaja", "ArqueosCajaDetalle", "EstadosDispositivosPwa",
                "Comprobantes", "ItemsComprobante", "Sucursales", "Usuarios"
            };

            foreach (var table in tables)
            {
                migrationBuilder.Sql($@"DROP POLICY IF EXISTS tenant_isolation_policy ON ""{table}"";");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" DISABLE ROW LEVEL SECURITY;");
            }

            migrationBuilder.DropIndex(
                name: "IX_VariantesProducto_AtributosJson",
                table: "VariantesProducto");

            migrationBuilder.DropIndex(
                name: "IX_Productos_MetadatosJson",
                table: "Productos");

            migrationBuilder.AlterColumn<string>(
                name: "MetadatosJson",
                table: "Productos",
                type: "text",
                nullable: false,
                oldType: "jsonb");

            migrationBuilder.AlterColumn<string>(
                name: "AtributosJson",
                table: "VariantesProducto",
                type: "text",
                nullable: false,
                oldType: "jsonb");
        }
    }
}
