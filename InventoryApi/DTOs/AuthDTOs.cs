namespace InventoryApi.DTOs;
public class RegisterDTO
{
    public string Username {get; set;} = string.Empty;
    public string Email { get; set;} = string.Empty;

    public string Password { get; set;} = string.Empty;
    public int RoleId { get; set; }
}

public class LoginDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime Expiry { get; set; }
}
