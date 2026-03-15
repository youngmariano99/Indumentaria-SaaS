using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProveedoresTriggers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Trigger para inicializar SaldoPendiente en FacturaProveedor
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION set_initial_invoice_balance() 
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.""SaldoPendiente"" := NEW.""MontoTotal"";
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;

                DROP TRIGGER IF EXISTS trg_set_initial_balance ON ""FacturasProveedores"";
                CREATE TRIGGER trg_set_initial_balance
                BEFORE INSERT ON ""FacturasProveedores""
                FOR EACH ROW EXECUTE FUNCTION set_initial_invoice_balance();
            ");

            // 2. Trigger para actualizar SaldoPendiente cuando cambia una Distribución de Pago
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION update_vendor_invoice_balance() 
                RETURNS TRIGGER AS $$
                BEGIN
                    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
                        UPDATE ""FacturasProveedores""
                        SET ""SaldoPendiente"" = ""MontoTotal"" - (
                            SELECT COALESCE(SUM(""MontoAsignado""), 0) 
                            FROM ""DistribucionesPagosFacturas"" 
                            WHERE ""FacturaProveedorId"" = NEW.""FacturaProveedorId""
                        )
                        WHERE ""Id"" = NEW.""FacturaProveedorId"";
                    END IF;
                    
                    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
                        IF (OLD.""FacturaProveedorId"" IS NOT NULL) THEN
                            UPDATE ""FacturasProveedores""
                            SET ""SaldoPendiente"" = ""MontoTotal"" - (
                                SELECT COALESCE(SUM(""MontoAsignado""), 0) 
                                FROM ""DistribucionesPagosFacturas"" 
                                WHERE ""FacturaProveedorId"" = OLD.""FacturaProveedorId""
                            )
                            WHERE ""Id"" = OLD.""FacturaProveedorId"";
                        END IF;
                    END IF;
                    
                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;

                DROP TRIGGER IF EXISTS trg_update_invoice_balance ON ""DistribucionesPagosFacturas"";
                CREATE TRIGGER trg_update_invoice_balance
                AFTER INSERT OR UPDATE OR DELETE ON ""DistribucionesPagosFacturas""
                FOR EACH ROW EXECUTE FUNCTION update_vendor_invoice_balance();
            ");

            // 3. Trigger para actualizar Saldo del Proveedor (Deuda/Crédito)
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION update_vendor_total_balance() 
                RETURNS TRIGGER AS $$
                BEGIN
                    -- Si es factura: resta al saldo (aumenta deuda)
                    IF (TG_RELNAME = 'FacturasProveedores') THEN
                        IF (TG_OP = 'INSERT') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" - NEW.""MontoTotal"" WHERE ""Id"" = NEW.""ProveedorId"";
                        ELSIF (TG_OP = 'DELETE') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" + OLD.""MontoTotal"" WHERE ""Id"" = OLD.""ProveedorId"";
                        ELSIF (TG_OP = 'UPDATE') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" + OLD.""MontoTotal"" - NEW.""MontoTotal"" WHERE ""Id"" = NEW.""ProveedorId"";
                        END IF;
                    -- Si es pago: suma al saldo (disminuye deuda)
                    ELSIF (TG_RELNAME = 'PagosProveedores') THEN
                        IF (TG_OP = 'INSERT') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" + NEW.""MontoTotal"" WHERE ""Id"" = NEW.""ProveedorId"";
                        ELSIF (TG_OP = 'DELETE') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" - OLD.""MontoTotal"" WHERE ""Id"" = OLD.""ProveedorId"";
                        ELSIF (TG_OP = 'UPDATE') THEN
                            UPDATE ""Proveedores"" SET ""Saldo"" = ""Saldo"" - OLD.""MontoTotal"" + NEW.""MontoTotal"" WHERE ""Id"" = NEW.""ProveedorId"";
                        END IF;
                    END IF;
                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;

                DROP TRIGGER IF EXISTS trg_update_vendor_balance_factura ON ""FacturasProveedores"";
                CREATE TRIGGER trg_update_vendor_balance_factura
                AFTER INSERT OR UPDATE OR DELETE ON ""FacturasProveedores""
                FOR EACH ROW EXECUTE FUNCTION update_vendor_total_balance();

                DROP TRIGGER IF EXISTS trg_update_vendor_balance_pago ON ""PagosProveedores"";
                CREATE TRIGGER trg_update_vendor_balance_pago
                AFTER INSERT OR UPDATE OR DELETE ON ""PagosProveedores""
                FOR EACH ROW EXECUTE FUNCTION update_vendor_total_balance();
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_set_initial_balance ON \"FacturasProveedores\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_update_invoice_balance ON \"DistribucionesPagosFacturas\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_update_vendor_balance_factura ON \"FacturasProveedores\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_update_vendor_balance_pago ON \"PagosProveedores\";");
            
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS set_initial_invoice_balance();");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_vendor_invoice_balance();");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_vendor_total_balance();");
        }
    }
}
