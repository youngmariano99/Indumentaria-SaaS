using Application.Common.Interfaces;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Infrastructure.Workers;

/// <summary>
/// Background Service que escanea el stock diariamente y genera borradores de órdenes de compra
/// usando la fórmula de Punto de Reorden (ROP).
/// </summary>
public class PuntoReordenWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PuntoReordenWorker> _logger;

    public PuntoReordenWorker(IServiceProvider serviceProvider, ILogger<PuntoReordenWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Iniciando escaneo de Punto de Reorden (ROP)...");

            try 
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

                // 1. Obtener todos los productos que tienen relación con proveedores
                var items = await dbContext.ProveedoresProductos
                    .Include(pp => pp.Producto)
                    .ThenInclude(p => p.Categoria)
                    .ToListAsync(stoppingToken);

                // 2. Obtener stock actual consolidado por producto
                var inventarios = await dbContext.Inventarios
                    .ToListAsync(stoppingToken);

                foreach (var item in items)
                {
                    var stockActual = inventarios
                        .Where(i => i.ProductVariantId == item.ProductoId) // Nota: Esto depende de si el stock es por Producto o Variante
                        .Sum(i => i.StockActual);

                    // Extraer metadatos de ROP (Simulado desde JSONB)
                    // En un escenario real, leeríamos de item.Producto.MetadatosJson
                    decimal demandaDiaria = 5; // Valor por defecto
                    decimal stockSeguridad = 10; // Valor por defecto

                    decimal rop = (demandaDiaria * item.LeadTimeDays) + stockSeguridad;

                    if (stockActual <= rop)
                    {
                        _logger.LogWarning("ALERTA ROP: El producto {Producto} ha llegado a su punto de reorden ({Stock} <= {ROP}).", 
                            item.Producto.Nombre, stockActual, rop);
                        
                        // TODO: Crear borrador de Orden de Compra
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ejecutando el worker de ROP.");
            }

            // Ejecutar una vez al día (o según configuración)
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
