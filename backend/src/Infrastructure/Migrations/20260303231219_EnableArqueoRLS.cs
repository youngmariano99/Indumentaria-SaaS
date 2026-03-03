using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableArqueoRLS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var rlsTables = new[] { "ArqueosCaja", "ArqueosCajaDetalle" };

            foreach(var table in rlsTables)
            {
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" ENABLE ROW LEVEL SECURITY;");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" FORCE ROW LEVEL SECURITY;");
                
                migrationBuilder.Sql($@"
                    CREATE POLICY tenant_isolation_policy ON ""{table}""
                    USING (""TenantId"" = current_setting('app.current_tenant', true)::uuid);
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var rlsTables = new[] { "ArqueosCaja", "ArqueosCajaDetalle" };

            foreach(var table in rlsTables)
            {
                migrationBuilder.Sql($@"DROP POLICY IF EXISTS tenant_isolation_policy ON ""{table}"";");
                migrationBuilder.Sql($@"ALTER TABLE ""{table}"" DISABLE ROW LEVEL SECURITY;");
            }
        }
    }
}
