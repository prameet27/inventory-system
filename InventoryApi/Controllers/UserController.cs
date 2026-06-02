using InventoryApi.Data;
using InventoryApi.DTOs;
using InventoryApi.Models;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notify; 

    public UsersController(AppDbContext context, NotificationService notify)
    {
        _context = context;
        _notify =  notify;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Select(u => new UserResponseDTO
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.RoleName,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound("User not found.");

        return Ok(new UserResponseDTO
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.RoleName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateUserDTO dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Email already exists.");

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

        await _notify.NotifyAll(
            $"New User Created: {user.Username}",
            "success",
            GetCurrentUsername(),
            "Added",
            user.Username
        );
        return Ok("User created successfully.");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateUserDTO dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        user.Username = dto.Username;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;
        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        await _notify.NotifyAll(
            $"User Updated: {user.Username}",
            "info",
            GetCurrentUsername(),
            "Updated",
            user.Username
        );
        return Ok("User updated successfully.");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        // Delete related stock ledgers first
        var stockLedgers = await _context.StockLedgers
            .Where(s => s.CreatedByUserId == id)
            .ToListAsync();

        _context.StockLedgers.RemoveRange(stockLedgers);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        await _notify.NotifyAll(
            $"User Deleted: {user.Username}",
            "warning",
            GetCurrentUsername(),
            "Deleted",
            user.Username
        );

        return Ok("User deleted successfully.");
    }

    [HttpPut("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] string newPassword)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();
        return Ok("Password changed successfully.");
    }

    private string GetCurrentUsername()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
    }
}