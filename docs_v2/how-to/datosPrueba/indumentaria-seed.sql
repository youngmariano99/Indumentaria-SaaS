-- ==============================================================================
-- SCRIPT DE PRUEBA: BIG DATA INDUMENTARIA (10.000 PRODUCTOS + Talle/Color)
-- ==============================================================================
-- Genera un entorno masivo con 8 categorías específicas y 10.000 ítems.
-- Incluye CRM, Historial de Ventas y Arqueos.

DO $$
DECLARE
    -- Identificadores Globales
    v_tenant_id UUID := '110e8400-e29b-41d4-a716-446655440001';
    v_sucursal_id UUID := '220e8400-e29b-41d4-a716-446655441112';
    v_usuario_id UUID := '330e8400-e29b-41d4-a716-446655442223';
    v_rubro_id UUID;
    
    -- Métodos de Pago
    v_mp_efectivo UUID := gen_random_uuid();
    v_mp_tarjeta UUID := gen_random_uuid();
    v_mp_ctaccte UUID := gen_random_uuid();

    -- Categorías Solicitadas
    v_cat_pant_h UUID := gen_random_uuid();
    v_cat_rem_h UUID := gen_random_uuid();
    v_cat_cam_h UUID := gen_random_uuid();
    v_cat_acc_h UUID := gen_random_uuid();
    v_cat_pant_m UUID := gen_random_uuid();
    v_cat_rem_m UUID := gen_random_uuid();
    v_cat_vest_m UUID := gen_random_uuid();
    v_cat_acc_m UUID := gen_random_uuid();

    -- Listas para lógica de inserts
    v_cli_ids UUID[] := ARRAY[]::UUID[];
    v_var_ids UUID[] := ARRAY[]::UUID[];
    
    -- Variables auxiliares
    v_temp_id UUID;
    v_prod_id UUID;
    v_var_id UUID;
    v_arqueo_id UUID;
    v_venta_id UUID;
    v_curr_cat UUID;
    v_nombre_base TEXT;
    v_talle TEXT;
    v_color TEXT;
    i INTEGER;
    j INTEGER;
BEGIN
    -- 1. Obtener Rubro
    SELECT "Id" INTO v_rubro_id FROM "Rubros" WHERE "Slug" = 'indumentaria';

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
    DELETE FROM "Sucursales" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Usuarios" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "MetodosPago" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Clientes" WHERE "TenantId" = v_tenant_id;
    DELETE FROM "Inquilinos" WHERE "Id" = v_tenant_id;

    -- 3. INFRAESTRUCTURA
    INSERT INTO "Inquilinos" ("Id", "NombreComercial", "CUIT", "Subdominio", "ConfiguracionRegional", "FechaCreacion", "RubroId", "ConfiguracionTallesJson", "ConfiguracionAtributosJson", "FeaturesJson")
    VALUES (v_tenant_id, 'Moda Central Indumentaria', '20-11122233-4', 'indumentaria-demo', 'es-AR', NOW() - interval '30 days', v_rubro_id, '{}', '{}', '{"ModuloVentas": true, "ModuloStock": true, "ModuloCRM": true}');

    INSERT INTO "Sucursales" ("Id", "TenantId", "Nombre", "Direccion", "EsDepositoCentral", "FeaturesJson")
    VALUES (v_sucursal_id, v_tenant_id, 'Local Recoleta Principal', 'Av. Santa Fe 1234', TRUE, '{}');

    INSERT INTO "Usuarios" ("Id", "TenantId", "Nombre", "Email", "PasswordHash", "Rol", "FeaturesJson")
    VALUES (v_usuario_id, v_tenant_id, 'Moda Admin', 'demo@indumentaria.com', '$2y$10$nfmv8z9a4r9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f', 2, '{}');

    INSERT INTO "MetodosPago" ("Id", "TenantId", "Nombre", "Descripcion", "Activo", "RequiereAprobacionAdmin") VALUES 
    (v_mp_efectivo, v_tenant_id, 'Efectivo', 'Caja diaria', TRUE, FALSE),
    (v_mp_tarjeta, v_tenant_id, 'Tarjeta / QR', 'Pagos digitales', TRUE, FALSE),
    (v_mp_ctaccte, v_tenant_id, 'Cuenta Corriente', 'Crédito cliente VIP', TRUE, TRUE);

    -- 4. CREAR CATEGORÍAS SOLICITADAS
    INSERT INTO "Categorias" ("Id", "TenantId", "Nombre", "Descripcion", "Ncm", "IsDeleted", "CreatedAt", "EsquemaAtributosJson") VALUES
    (v_cat_pant_h, v_tenant_id, 'Pantalones Hombre', 'Jeans, chinos, shorts', '', FALSE, NOW(), '[]'),
    (v_cat_rem_h, v_tenant_id, 'Remeras Hombre', 'Basicas, estampadas', '', FALSE, NOW(), '[]'),
    (v_cat_cam_h, v_tenant_id, 'Camisas Hombre', 'Manga corta, larga, formal', '', FALSE, NOW(), '[]'),
    (v_cat_acc_h, v_tenant_id, 'Accesorios Hombre', 'Cinturones, medias', '', FALSE, NOW(), '[]'),
    (v_cat_pant_m, v_tenant_id, 'Pantalones Mujer', 'Leggings, rectos, mom', '', FALSE, NOW(), '[]'),
    (v_cat_rem_m, v_tenant_id, 'Remeras Mujer', 'Tops, musculosas', '', FALSE, NOW(), '[]'),
    (v_cat_vest_m, v_tenant_id, 'Vestidos Mujer', 'Cortos, largos, fiesta', '', FALSE, NOW(), '[]'),
    (v_cat_acc_m, v_tenant_id, 'Accesorios Mujer', 'Carteras, bufandas', '', FALSE, NOW(), '[]');

    -- 5. GENERAR 50 CLIENTES CRM
    FOR i IN 1..50 LOOP
        v_temp_id := gen_random_uuid();
        INSERT INTO "Clientes" ("Id", "TenantId", "Nombre", "Documento", "Email", "SaldoAFavor", "IsDeleted", "PreferenciasJson", "CreatedAt")
        VALUES (v_temp_id, v_tenant_id, 'Cliente Moda ' || i, '20-' || (10000000 + i) || '-9', 'cliente' || i || '@indumentaria.com', 
               CASE WHEN i % 10 = 0 THEN -5000 WHEN i % 15 = 0 THEN 1200 ELSE 0 END, FALSE, '{}', NOW() - (i || ' days')::interval);
        v_cli_ids := array_append(v_cli_ids, v_temp_id);
    END LOOP;

    -- 6. GENERACIÓN MASIVA DE 10.000 PRODUCTOS
    FOR i IN 1..10000 LOOP
        IF i <= 1500 THEN v_curr_cat := v_cat_pant_h; v_nombre_base := 'Jean Duko Slim #' || (i % 50);
        ELSIF i <= 3000 THEN v_curr_cat := v_cat_rem_h; v_nombre_base := 'Remera Basica Algodon #' || (i % 30);
        ELSIF i <= 4000 THEN v_curr_cat := v_cat_cam_h; v_nombre_base := 'Camisa Lino Fresh #' || (i % 20);
        ELSIF i <= 5000 THEN v_curr_cat := v_cat_acc_h; v_nombre_base := 'Medias Urban Pack x3 #' || (i % 10);
        ELSIF i <= 6500 THEN v_curr_cat := v_cat_pant_m; v_nombre_base := 'Pantalón Mom Fit #' || (i % 40);
        ELSIF i <= 8000 THEN v_curr_cat := v_cat_rem_m; v_nombre_base := 'Musculosa Rib #' || (i % 30);
        ELSIF i <= 9000 THEN v_curr_cat := v_cat_vest_m; v_nombre_base := 'Vestido Flores Sky #' || (i % 20);
        ELSE v_curr_cat := v_cat_acc_m; v_nombre_base := 'Cinturón Cuero Eco #' || (i % 10);
        END IF;

        v_prod_id := gen_random_uuid();
        INSERT INTO "Productos" (
            "Id", "TenantId", "Nombre", "Descripcion", "PrecioBase", "CategoriaId", 
            "TipoProducto", "EsFraccionable", "IsDeleted", "CreatedAt", "MetadatosJson", "Temporada", "Origen", "EscalaTalles", "PesoKg", "Ean13"
        )
        VALUES (
            v_prod_id, v_tenant_id, v_nombre_base, 'Indumentaria de alta calidad para la temporada actual.', 
            (5 * i % 5000 + 1500), v_curr_cat, 1, FALSE, FALSE, NOW() - interval '30 days', '{}', 'OI2026', 'Nacional', 'Adulto', 0.5, 'EAN-IND-' || i
        );

        -- Generar Variaciones (S, M, L / Negro, Azul, Blanco)
        FOR j IN 1..3 LOOP
            v_var_id := gen_random_uuid();
            v_talle := CASE WHEN j = 1 THEN 'S' WHEN j = 2 THEN 'M' ELSE 'L' END;
            v_color := CASE WHEN i % 3 = 0 THEN 'Negro' WHEN i % 3 = 1 THEN 'Azul' ELSE 'Blanco' END;
            
            INSERT INTO "VariantesProducto" ("Id", "TenantId", "ProductId", "Talle", "Color", "SKU", "PrecioCosto", "AtributosJson")
            VALUES (v_var_id, v_tenant_id, v_prod_id, v_talle, v_color, 'SKU-MODA-' || i || '-' || j, (2 * i % 5000 + 500), '{}');
            
            IF i <= 1000 AND j = 1 THEN
                v_var_ids := array_append(v_var_ids, v_var_id);
            END IF;

            INSERT INTO "Inventarios" ("Id", "TenantId", "StoreId", "ProductVariantId", "StockActual", "StockMinimo", "StockDefectuoso", "StockRevision")
            VALUES (gen_random_uuid(), v_tenant_id, v_sucursal_id, v_var_id, (i % 50 + 5), 2, 0, 0);
        END LOOP;
    END LOOP;

    -- 7. VENTAS HISTÓRICAS
    FOR i IN 1..200 LOOP
        v_venta_id := gen_random_uuid();
        v_var_id := v_var_ids[(i % 1000) + 1];
        INSERT INTO "Ventas" (
            "Id", "TenantId", "UsuarioId", "MetodoPagoId", "Subtotal", "MontoTotal", "EstadoVenta", 
            "IdentificadorTicket", "CreatedAt", "ClienteId", "DescuentoGlobalPct", "DescuentoMonto", "RecargoGlobalPct", "RecargoMonto"
        )
        VALUES (v_venta_id, v_tenant_id, v_usuario_id, CASE WHEN i % 2 = 0 THEN v_mp_tarjeta ELSE v_mp_efectivo END, 
               12500, 12500, 1, 'MODA-TCK-' || i, NOW() - (i % 20 || ' days')::interval, v_cli_ids[(i % 50) + 1], 0, 0, 0, 0);
        
        INSERT INTO "VentasDetalles" ("Id", "TenantId", "VentaId", "VarianteProductoId", "Cantidad", "PrecioUnitarioAplicado", "CostoUnitarioAplicado", "SubtotalLinea", "AlicuotaIvaPct", "MontoIvaTotal")
        VALUES (gen_random_uuid(), v_tenant_id, v_venta_id, v_var_id, 1, 12500, 6000, 12500, 21, 2625);
    END LOOP;

    -- 8. CAJA ABIERTA
    INSERT INTO "ArqueosCaja" ("Id", "TenantId", "StoreId", "UsuarioId", "FechaApertura", "SaldoInicial", "TotalVentasEsperado", "TotalManualEsperado", "TotalRealContado", "Diferencia", "Estado")
    VALUES (gen_random_uuid(), v_tenant_id, v_sucursal_id, v_usuario_id, NOW() - interval '4 hours', 10000, 50000, 0, 0, 0, 1);

END $$;
