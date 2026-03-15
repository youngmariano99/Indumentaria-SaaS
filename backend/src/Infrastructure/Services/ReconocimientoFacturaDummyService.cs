using System.IO;
using System.Threading.Tasks;
using Application.Common.DTOs;
using Application.Common.Interfaces;

namespace Infrastructure.Services;

/// <summary>
/// Implementación Dummy para el Sprint 1. Simula el procesamiento de una factura.
/// </summary>
public class ReconocimientoFacturaDummyService : IReconocimientoFacturaService
{
    public Task<FacturaParseadaDto> ProcesarImagenAsync(Stream imagenStream)
    {
        // Simulamos un retraso
        // Task.Delay(2000).Wait();

        return Task.FromResult(new FacturaParseadaDto
        {
            NumeroFactura = "0001-00004561",
            FechaEmision = DateTime.UtcNow,
            MontoTotal = 15500.50m,
            CuitProveedor = "30-70809010-9",
            RazonSocialProveedor = "Proveedor Simulado S.A.",
            ConfidenceScore = 0.95,
            RawJson = "{\"mensaje\": \"Simulación de respuesta de Azure\"}",
            Items = new List<ItemFacturaParseadoDto>
            {
                new ItemFacturaParseadoDto { Descripcion = "Producto A", Cantidad = 10, PrecioUnitario = 1000, Total = 10000 },
                new ItemFacturaParseadoDto { Descripcion = "Producto B", Cantidad = 5, PrecioUnitario = 1100.10m, Total = 5500.50m }
            }
        });
    }
}
