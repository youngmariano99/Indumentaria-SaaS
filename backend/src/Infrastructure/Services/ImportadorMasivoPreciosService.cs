using System;
using System.IO;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using Infrastructure.Persistence.Contexts;

namespace Infrastructure.Services;

public class ImportadorMasivoPreciosService : IImportadorPreciosService
{
    private readonly ApplicationDbContext _context;

    public ImportadorMasivoPreciosService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> ImportarDesdeCsvAsync(Guid proveedorId, Stream csvStream)
    {
        var tenantId = _context.CurrentTenantId;
        var connection = (NpgsqlConnection)_context.Database.GetDbConnection();
        
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        // 1. Crear tabla temporal
        var tempTableName = $"temp_precios_{Guid.NewGuid():N}";
        using (var cmd = new NpgsqlCommand($"CREATE TEMP TABLE {tempTableName} (sku TEXT, nuevo_costo DECIMAL)", connection))
        {
            await cmd.ExecuteNonQueryAsync();
        }

        // 2. Carga masiva usando Binary Importer (Ultra-rápido)
        int count = 0;
        using (var writer = await connection.BeginBinaryImportAsync($"COPY {tempTableName} (sku, nuevo_costo) FROM STDIN (FORMAT BINARY)"))
        {
            using var reader = new StreamReader(csvStream);
            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;
                
                var parts = line.Split(',');
                if (parts.Length < 2) continue;

                if (decimal.TryParse(parts[1], out decimal costo))
                {
                    await writer.StartRowAsync();
                    await writer.WriteAsync(parts[0]); // sku
                    await writer.WriteAsync(costo);    // costo
                    count++;
                }
            }
            await writer.CompleteAsync();
        }

        // 3. SQL MERGE / UPDATE Masivo
        // Actualizamos ProveedorProducto y luego Producto (o VarianteProducto)
        var sqlUpdate = $@"
            -- Actualizar costos en la relación proveedor-producto
            UPDATE ""ProveedoresProductos"" pp
            SET ""Costo"" = t.nuevo_costo
            FROM {tempTableName} t
            WHERE pp.""VendorSku"" = t.sku 
              AND pp.""ProveedorId"" = @pId 
              AND pp.""TenantId"" = @tId;

            -- Opcional: Actualizar el precio de venta en Producto basado en una regla de negocio
            -- Por ahora solo actualizamos costos.
        ";

        using (var cmd = new NpgsqlCommand(sqlUpdate, connection))
        {
            cmd.Parameters.AddWithValue("pId", proveedorId);
            cmd.Parameters.AddWithValue("tId", tenantId);
            await cmd.ExecuteNonQueryAsync();
        }

        return count;
    }
}
