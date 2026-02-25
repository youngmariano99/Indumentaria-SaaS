namespace Application.DTOs.Auth;

public class LoginRequest
{
    public string Subdominio { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
