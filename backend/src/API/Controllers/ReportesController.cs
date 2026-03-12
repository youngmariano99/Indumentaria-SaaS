using Application.Features.Reports.DTOs;
using Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pulso-diario")]
    public async Task<ActionResult<PulsoDiarioDto>> GetPulsoDiario()
    {
        var result = await _mediator.Send(new ObtenerPulsoDiarioQuery());
        return Ok(result);
    }

    [HttpGet("corporativo")]
    public async Task<ActionResult<ReporteCorporativoDto>> GetReporteCorporativo()
    {
        return await _mediator.Send(new ObtenerReporteCorporativoQuery());
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        return await _mediator.Send(new ObtenerDashboardQuery());
    }

    [HttpGet("bajo-stock")]
    public async Task<ActionResult<System.Collections.Generic.List<BajoStockDto>>> GetBajoStock()
    {
        return await _mediator.Send(new ObtenerBajoStockQuery());
    }

    [HttpGet("valorizacion-inventario")]
    public async Task<ActionResult<System.Collections.Generic.List<ValorizacionInventarioDto>>> GetValorizacionInventario()
    {
        return await _mediator.Send(new ObtenerValorizacionInventarioQuery());
    }

    [HttpGet("aging-report")]
    public async Task<ActionResult<System.Collections.Generic.List<AgingReportDto>>> GetAgingReport()
    {
        return await _mediator.Send(new ObtenerAgingReportQuery());
    }

    [HttpGet("caja-ferreteria")]
    public async Task<ActionResult<CajaDetalleFerreteriaDto>> GetCajaFerreteria()
    {
        return await _mediator.Send(new ObtenerCajaFerreteriaQuery());
    }
}
