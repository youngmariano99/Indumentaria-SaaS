namespace Application.DTOs.Catalog;

public class FormSchemaDto
{
    public List<FormFieldDto> Fields { get; set; } = new();
    public string DynamicGrid { get; set; } = string.Empty;
    public Dictionary<string, object> SmartDefaults { get; set; } = new();
}

public class FormFieldDto
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "text"; // text, number, select
    public bool Required { get; set; }
    public int GridSpan { get; set; } = 1;
    public string? OptionsEndpoint { get; set; }
    public List<string>? Options { get; set; }
}
