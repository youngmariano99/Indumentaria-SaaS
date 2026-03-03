using System.Collections.Generic;

namespace Application.Features.Reports.DTOs;

public class ReporteCorporativoDto
{
    // Matriz ABC: Lista de productos con su clase (A, B o C) basada en ingresos
    public List<ItemABCModel> MatrizABC { get; set; } = new();

    // Rentabilidad General
    public decimal MargenBrutoTotal { get; set; }
    public decimal PorcentajeMargenBruto { get; set; }
}

public class ItemABCModel
{
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal IngresosAcumulados { get; set; }
    public decimal PorcentajeDelTotal { get; set; }
    public string Clasificacion { get; set; } = "C"; // A, B, C
    public decimal Rentabilidad { get; set; }
}
