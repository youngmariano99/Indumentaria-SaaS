namespace Core.Enums;

public enum DestinoDevolucion
{
    VentaDirecta = 1,      // Vuelve al StockActual para ser vendido
    Defectuoso = 2,        // Va a StockDefectuoso (dañado, roto)
    GarantiaProveedor = 3, // Va a StockRevision (para reclamo a fábrica)
    Descarte = 4           // No vuelve al stock (merma total)
}
