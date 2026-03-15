using System;
using System.IO;
using System.Threading.Tasks;

namespace Application.Common.Interfaces;

public interface IImportadorPreciosService
{
    Task<int> ImportarDesdeCsvAsync(Guid proveedorId, Stream csvStream);
}
