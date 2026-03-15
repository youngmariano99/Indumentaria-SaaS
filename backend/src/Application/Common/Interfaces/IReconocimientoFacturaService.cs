using System.IO;
using System.Threading.Tasks;
using Application.Common.DTOs;

namespace Application.Common.Interfaces;

/// <summary>
/// Puerto para el servicio de reconocimiento de facturas mediante IA.
/// Diseñado para ser implementado por Azure Document Intelligence en el futuro.
/// </summary>
public interface IReconocimientoFacturaService
{
    Task<FacturaParseadaDto> ProcesarImagenAsync(Stream imagenStream);
}
