-- ==============================================================================
-- SCRIPT DE PRUEBA: BIG DATA FERRETERÍA + PROVEEDORES (10.000 PRODUCTOS + AP)
-- ==============================================================================
-- Genera un entorno masivo con 8 categorías, 10.000 ítems y módulo de compras.

DO $$
DECLARE
    -- Identificadores Globales
    v_tenant_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    v_sucursal_id UUID := '660e8400-e29b-41d4-a716-446655441111';
    v_usuario_id UUID := '770e8400-e29b-41d4-a716-446655442222';
    v_rubro_id UUID;
    
    -- Métodos de Pago
    v_mp_efectivo UUID := gen_random_uuid();
    v_mp_tarjeta UUID := gen_random_uuid();
    v_mp_ctaccte UUID := gen_random_uuid();

    -- Categorías Solicitadas
    v_cat_fijaciones UUID := gen_random_uuid();
    v_cat_herr_mano UUID := gen_random_uuid();
    v_cat_herr_elec UUID := gen_random_uuid();
    v_cat_accesorios UUID := gen_random_uuid();
    v_cat_plomeria UUID := gen_random_uuid();
    v_cat_electricidad UUID := gen_random_uuid();
    v_cat_construccion UUID := gen_random_uuid();
    v_cat_pintureria UUID := gen_random_uuid();

    -- Listas para lógica de inserts
    v_cli_ids UUID[] := ARRAY[]::UUID[];
    v_var_ids UUID[] := ARRAY[]::UUID[];
    v_prov_ids UUID[] := ARRAY[]::UUID[];
    
    -- Variables auxiliares
    v_temp_id UUID;
    v_prod_id UUID;
    v_var_id UUID;
    v_arqueo_id UUID;
    v_venta_id UUID;
    v_prov_id UUID;
    v_factura_id UUID;
    v_pago_id UUID;
    v_curr_cat UUID;
    v_nombre_base TEXT;
    v_medida TEXT;
    v_material TEXT;
    i INTEGER;
    j INTEGER;
BEGIN
    -- 1. Obtener Rubro
    SELECT "Id" INTO v_rubro_id FROM "Rubros" WHERE "Slug" = 'ferreteria';

    -- 2. LIMPIEZA TOTAL
    DELETE FROM "MovimientosSaldosClientes" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Inventarios" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "VentasDetalles" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Ventas" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "ArqueosCajaDetalle" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "ArqueosCaja" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "VariantesProducto" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Productos" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Categorias" WHERE "TenantId" = v_tenant_id;
    
    -- Limpieza Módulo Proveedores
    DELETE FROM "DistribucionesPagosFacturas" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "ChequesTerceros" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "PagosProveedores" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "FacturasProveedores" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "ProveedoresProductos" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Proveedores" WHERE "TenantId" = v_tenant_id;

    DELETE FROM "Sucursales" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Usuarios" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "MetodosPago" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Clientes" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Inquilinos" WHERE "Id" = v_tenant_id;

    -- 3. INFRAESTRUCTURA
    INSERT INTO "Inquilinos" ("Id", "NombreComercial", "CUIT", "Subdominio", "ConfiguracionRegional", "FechaCreacion", "RubroId", "ConfiguracionTallesJson", "ConfiguracionAtributosJson", "FeaturesJson")
    VALUES (v_tenant_id, 'Gran Ferretería Depot', '30-44455566-1', 'ferre-demo', 'es-AR', NOW() - interval '60 days', v_rubro_id, '{}', '{}', '{"ModuloVentas": true, "ModuloStock": true, "ModuloCRM": true, "ModuloProveedores": true}');

    INSERT INTO "Sucursales" ("Id", "TenantId", "Nombre", "Direccion", "EsDepositoCentral", "FeaturesJson")
    VALUES (v_sucursal_id, v_tenant_id, 'Centro Logístico Principal', 'Industrial Park S/N', TRUE, '{}');

    INSERT INTO "Usuarios" ("Id", "TenantId", "Nombre", "Email", "PasswordHash", "Rol", "FeaturesJson")
    VALUES (v_usuario_id, v_tenant_id, 'Master Admin', 'demo@ferreteria.com', '$2a$11$uvBQWTdzwah2Ixdxhpwr2egCcjuiokgzzifpBsVpV7qV5aVX1gDhS', 2, '{}');

    INSERT INTO "MetodosPago" ("Id", "TenantId", "Nombre", "Descripcion", "Activo", "RequiereAprobacionAdmin") VALUES 
    (v_mp_efectivo, v_tenant_id, 'Efectivo', 'Caja diaria', TRUE, FALSE),
    (v_mp_tarjeta, v_tenant_id, 'Tarjeta / Transferencia', 'Pagos digitales', TRUE, FALSE),
    (v_mp_ctaccte, v_tenant_id, 'Cuenta Corriente', 'Crédito mayorista', TRUE, TRUE);

    -- 4. CREAR CATEGORÍAS SOLICITADAS
    INSERT INTO "Categorias" ("Id", "TenantId", "Nombre", "Descripcion", "Ncm", "IsDeleted", "CreatedAt", "EsquemaAtributosJson") VALUES
    (v_cat_fijaciones, v_tenant_id, 'Fijaciones / Tornillería', 'Tornillos, clavos, arandelas', '', FALSE, NOW(), '[]'),
    (v_cat_herr_mano, v_tenant_id, 'Herramientas de Mano', 'Martillos, pinzas, sierras', '', FALSE, NOW(), '[]'),
    (v_cat_herr_elec, v_tenant_id, 'Herramientas Eléctricas', 'Taladros, amoladoras', '', FALSE, NOW(), '[]'),
    (v_cat_accesorios, v_tenant_id, 'Accesorios', 'Mechas, discos, lijas', '', FALSE, NOW(), '[]'),
    (v_cat_plomeria, v_tenant_id, 'Plomería', 'Caños, grifería, termofusión', '', FALSE, NOW(), '[]'),
    (v_cat_electricidad, v_tenant_id, 'Electricidad', 'Cables, térmicas, luz', '', FALSE, NOW(), '[]'),
    (v_cat_construccion, v_tenant_id, 'Construcción', 'Mezclas, perfiles, durlock', '', FALSE, NOW(), '[]'),
    (v_cat_pintureria, v_tenant_id, 'Pinturería', 'Esmaltes, látex, pinceles', '', FALSE, NOW(), '[]');

    -- 5. GENERAR PROVEEDORES
    FOR i IN 1..10 LOOP
        v_prov_id := gen_random_uuid();
        INSERT INTO "Proveedores" ("Id", "TenantId", "RazonSocial", "NombreFantasia", "Cuit", "CondicionIva", "Email", "Telefono", "Direccion", "Saldo", "IsDeleted", "CreatedAt")
        VALUES (v_prov_id, v_tenant_id, 'Proveedor Mayorista ' || i, 'Ferre-Tech ' || i, '30-777888' || i || '-1', 1, 'ventas@prov' || i || '.com', '011-4444-555' || i, 'Av. Industrial ' || i, 0, FALSE, NOW());
        v_prov_ids := array_append(v_prov_ids, v_prov_id);
    END LOOP;

    -- 6. GENERAR FACTURAS DE PROVEEDORES (Cuentas por Pagar)
    FOR i IN 1..20 LOOP
        v_factura_id := gen_random_uuid();
        v_prov_id := v_prov_ids[(i % 10) + 1];
        INSERT INTO "FacturasProveedores" (
            "Id", "TenantId", "ProveedorId", "NumeroFactura", "FechaEmision", "FechaVencimiento", 
            "MontoTotal", "SaldoPendiente", "Origen", "EstadoProcesamiento", "IsDeleted", "CreatedAt"
        )
        VALUES (
            v_factura_id, v_tenant_id, v_prov_id, '0001-0000' || 100 + i, NOW() - (i || ' days')::interval, NOW() + (30 - i || ' days')::interval,
            15000 + (i * 1000), 15000 + (i * 1000), 0, 3, FALSE, NOW()
        );
        
        -- Algunos pagos parciales
        IF i % 4 = 0 THEN
            v_pago_id := gen_random_uuid();
            INSERT INTO "PagosProveedores" ("Id", "TenantId", "ProveedorId", "FechaPago", "MontoTotal", "MetodoPagoId", "IsDeleted", "CreatedAt")
            VALUES (v_pago_id, v_tenant_id, v_prov_id, NOW(), 5000, v_mp_efectivo, FALSE, NOW());
            
            INSERT INTO "DistribucionesPagosFacturas" ("Id", "TenantId", "PagoProveedorId", "FacturaProveedorId", "MontoAsignado")
            VALUES (gen_random_uuid(), v_tenant_id, v_pago_id, v_factura_id, 5000);
            
            -- El trigger se encargará de actualizar SaldoPendiente en Factura y Saldo en Proveedor
        END IF;
    END LOOP;

    -- 7. GENERAR 50 CLIENTES CRM (Fijo por simplicidad)
    FOR i IN 1..50 LOOP
        v_temp_id := gen_random_uuid();
        INSERT INTO "Clientes" ("Id", "TenantId", "Nombre", "Documento", "Email", "SaldoAFavor", "IsDeleted", "PreferenciasJson", "CreatedAt")
        VALUES (v_temp_id, v_tenant_id, 'Cliente Pro ' || i, '20-' || (20000000 + i) || '-5', 'user' || i || '@ferreteria.com', 
               CASE WHEN i % 10 = 0 THEN -10000 WHEN i % 15 = 0 THEN 2500 ELSE 0 END, FALSE, '{}', NOW() - (i || ' days')::interval);
        v_cli_ids := array_append(v_cli_ids, v_temp_id);
    END LOOP;

    -- 8. GENERACIÓN MASIVA DE 10.000 PRODUCTOS
    FOR i IN 1..10000 LOOP
        -- Lógica de distribución solicitada
        IF i <= 2000 THEN 
            v_curr_cat := v_cat_fijaciones; v_nombre_base := 'Tornillo Wood-Fix #' || (i % 50);
        ELSIF i <= 3500 THEN 
            v_curr_cat := v_cat_herr_mano; v_nombre_base := 'Destornillador Phillips PRO ' || (i % 30);
        ELSIF i <= 4300 THEN 
            v_curr_cat := v_cat_herr_elec; v_nombre_base := 'Taladro Percutor ' || (450 + i % 500) || 'W';
        ELSIF i <= 5500 THEN 
            v_curr_cat := v_cat_accesorios; v_nombre_base := 'Disco de Corte Diamante ' || (i % 20) || 'mm';
        ELSIF i <= 7000 THEN 
            v_curr_cat := v_cat_plomeria; v_nombre_base := 'Caño PVC Termofusión ' || (20 + i % 100) || 'mm';
        ELSIF i <= 8200 THEN 
            v_curr_cat := v_cat_electricidad; v_nombre_base := 'Térmica Sica ' || (10 + i % 50) || 'A';
        ELSIF i <= 9200 THEN 
            v_curr_cat := v_cat_construccion; v_nombre_base := 'Perfil Galvanizado ' || (i % 100) || 'm';
        ELSE 
            v_curr_cat := v_cat_pintureria; v_nombre_base := 'Látex Interior Premium ' || (i % 20) || 'Lts';
        END IF;

        v_prod_id := gen_random_uuid();
        INSERT INTO "Productos" (
            "Id", "TenantId", "Nombre", "Descripcion", "PrecioBase", "CategoriaId", 
            "TipoProducto", "EsFraccionable", "IsDeleted", "CreatedAt", "MetadatosJson", "Temporada", "Origen", "EscalaTalles", "PesoKg", "Ean13"
        )
        VALUES (
            v_prod_id, v_tenant_id, v_nombre_base, 'Calidad certificada para uso intensivo.', 
            (5 * i % 5000 + 100), v_curr_cat, 6, (i % 25 = 0), FALSE, NOW() - interval '45 days', '{}', '', 'Nacional', '', (i % 5), 'EAN-' || i
        );

        -- Generar 2 Variaciones por producto con Medidas y Materiales reales
        FOR j IN 1..2 LOOP
            v_var_id := gen_random_uuid();
            v_medida := CASE WHEN j = 1 THEN '1/2"' WHEN j = 2 THEN '3/4"' ELSE '1"' END;
            v_material := CASE WHEN i % 3 = 0 THEN 'Acero' WHEN i % 3 = 1 THEN 'Bronce' ELSE 'PVC' END;
            
            INSERT INTO "VariantesProducto" ("Id", "TenantId", "ProductId", "Talle", "Color", "SKU", "PrecioCosto", "AtributosJson")
            VALUES (v_var_id, v_tenant_id, v_prod_id, v_medida, v_material, 'SKU-PRO-' || i || '-' || j, (2 * i % 5000 + 50), '{}');
            
            -- Guardar los primeros 1000 variantes para usarlas en ventas (para no saturar el array)
            IF i <= 1000 AND j = 1 THEN
                v_var_ids := array_append(v_var_ids, v_var_id);
            END IF;

            INSERT INTO "Inventarios" ("Id", "TenantId", "StoreId", "ProductVariantId", "StockActual", "StockMinimo", "StockDefectuoso", "StockRevision")
            VALUES (gen_random_uuid(), v_tenant_id, v_sucursal_id, v_var_id, (i % 200 + 10), 5, 0, 0);
        END LOOP;
    END LOOP;

    -- 9. GENERAR 200 VENTAS HISTÓRICAS (Cruzadas entre clientes y catálogos)
    FOR i IN 1..200 LOOP
        v_venta_id := gen_random_uuid();
        v_var_id := v_var_ids[(i % 1000) + 1];
        INSERT INTO "Ventas" (
            "Id", "TenantId", "UsuarioId", "MetodoPagoId", "Subtotal", "MontoTotal", "EstadoVenta", 
            "IdentificadorTicket", "CreatedAt", "ClienteId", "DescuentoGlobalPct", "DescuentoMonto", "RecargoGlobalPct", "RecargoMonto"
        )
        VALUES (v_venta_id, v_tenant_id, v_usuario_id, CASE WHEN i % 3 = 0 THEN v_mp_tarjeta ELSE v_mp_efectivo END, 
               8500, 8500, 1, 'TCK-INV-' || i, NOW() - (i % 30 || ' days')::interval, v_cli_ids[(i % 50) + 1], 0, 0, 0, 0);
        
        INSERT INTO "VentasDetalles" ("Id", "TenantId", "VentaId", "VarianteProductoId", "Cantidad", "PrecioUnitarioAplicado", "CostoUnitarioAplicado", "SubtotalLinea", "AlicuotaIvaPct", "MontoIvaTotal")
        VALUES (gen_random_uuid(), v_tenant_id, v_venta_id, v_var_id, 2, 4250, 2100, 8500, 21, 1785);
    END LOOP;

    -- 10. ARQUEOS HISTÓRICOS (Visible en Historial)
    FOR i IN 1..15 LOOP
        v_arqueo_id := gen_random_uuid();
        INSERT INTO "ArqueosCaja" (
            "Id", "TenantId", "StoreId", "UsuarioId", "FechaApertura", "FechaCierre", 
            "SaldoInicial", "TotalVentasEsperado", "TotalManualEsperado", "TotalRealContado", "Diferencia", "Estado"
        )
        VALUES (v_arqueo_id, v_tenant_id, v_sucursal_id, v_usuario_id, NOW() - (i * 3 || ' days')::interval - interval '9 hours', 
               NOW() - (i * 3 || ' days')::interval, 5000, 25000, 0, 30000, 0, 2);
        
        INSERT INTO "ArqueosCajaDetalle" ("Id", "TenantId", "ArqueoCajaId", "MetodoPagoId", "MontoEsperado", "MontoReal", "Diferencia")
        VALUES (gen_random_uuid(), v_tenant_id, v_arqueo_id, v_mp_efectivo, 25000, 25000, 0);
    END LOOP;

    -- 11. VENTAS DE HOY (Pulso Diario Activo)
    FOR i IN 1..15 LOOP
        v_venta_id := gen_random_uuid();
        v_var_id := v_var_ids[(i * 10) % 1000 + 1];
        INSERT INTO "Ventas" ("Id", "TenantId", "UsuarioId", "MetodoPagoId", "Subtotal", "MontoTotal", "EstadoVenta", "IdentificadorTicket", "CreatedAt", "DescuentoGlobalPct", "DescuentoMonto", "RecargoGlobalPct", "RecargoMonto")
        VALUES (v_venta_id, v_tenant_id, v_usuario_id, v_mp_efectivo, 12000, 12000, 1, 'T-LIVE-' || i, NOW(), 0, 0, 0, 0);
        
        INSERT INTO "VentasDetalles" ("Id", "TenantId", "VentaId", "VarianteProductoId", "Cantidad", "PrecioUnitarioAplicado", "CostoUnitarioAplicado", "SubtotalLinea", "AlicuotaIvaPct", "MontoIvaTotal")
        VALUES (gen_random_uuid(), v_tenant_id, v_venta_id, v_var_id, 3, 4000, 2000, 12000, 21, 2520);
    END LOOP;

    -- 12. CAJA ABIERTA
    INSERT INTO "ArqueosCaja" ("Id", "TenantId", "StoreId", "UsuarioId", "FechaApertura", "SaldoInicial", "TotalVentasEsperado", "TotalManualEsperado", "TotalRealContado", "Diferencia", "Estado")
    VALUES (gen_random_uuid(), v_tenant_id, v_sucursal_id, v_usuario_id, NOW() - interval '5 hours', 15000, 180000, 0, 0, 0, 1);

END $$;
