using System;

namespace Application.DTOs.Ajustes;

public class AtributoConfiguracionDto
{
    public Guid Id { get; set; }
    public string Grupo { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public int Orden { get; set; }
}
