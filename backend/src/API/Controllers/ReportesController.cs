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
}
