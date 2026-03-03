using System;
using System.Collections.Generic;

namespace Application.Features.Reports.DTOs;

public class DashboardDto
{
    // Métricas de Usuarios y Membresía
    public int UsuariosActivos { get; set; }
    public int UsuariosRegistrados { get; set; }
    public int DiasRestantesMembresia { get; set; }

    // Métricas de Productos
    public int TotalProductos { get; set; }
    public int ProductosNuevosHoy { get; set; }
    public int ProductosSinStock { get; set; }
    public int ProductosStockBajo { get; set; }

    // Ventas últimos 7 días
    public List<VentaDiariaDto> VentasUltimos7Dias { get; set; } = new();

    // Métodos de Pago Hoy
    public List<MetodoPagoResumenDto> MetodosPagoHoy { get; set; } = new();

    // Cartera de Clientes
    public CarteraClientesDto CarteraClientes { get; set; } = new();

    // Top Productos (Semana)
    public List<RankingProductoDto> TopProductosSemana { get; set; } = new();
}

public class VentaDiariaDto
{
    public string Dia { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}

public class CarteraClientesDto
{
    public int ClientesConDeuda { get; set; }
    public int ClientesActivos { get; set; }
    public decimal DeudaTotal { get; set; }
}
