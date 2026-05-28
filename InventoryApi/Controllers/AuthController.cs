using InventoryApi.Data;
using InventoryApi.DTOs;
using InventoryApi.Helpers;
using InventoryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController: ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthController(AppDbContext context, JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDTO dto)
    {
        if(await _context.Users.AnyAsync(u=>u.Email == dto.Email))
        {
            return BadRequest("Email Already Exists");
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User Registered Successfully" );
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);
 
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid Email or Password");   
        }

        if(!user.IsActive)
        {
            return Unauthorized("User Account is Inactive");
        }

        var expiry = DateTime.UtcNow.AddMinutes(60);
        var token = _jwtHelper.GenerateToken(user);

        return Ok(new AuthResponseDTO
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role?.RoleName??"",
            Expiry = expiry
        });
    }
}