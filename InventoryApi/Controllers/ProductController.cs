using InventoryApi.Data;
using InventoryApi.DTOs;
using InventoryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private async Task<string> GenerateProductCode()
    {
        var last = await _context.Products
            .OrderByDescending(p => p.Id)
            .FirstOrDefaultAsync();

        int nextNumber = (last == null) ? 1 : last.Id + 1;
        return $"PRD{nextNumber:D5}";
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _context.Products
            .Select(p => new ProductResponseDTO
            {
                Id = p.Id,
                ProductCode = p.ProductCode,
                ProductName = p.ProductName,
                Unit = p.Unit,
                Category = p.Category,
                MRP = p.MRP,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            }).ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Product not found.");

        return Ok(new ProductResponseDTO
        {
            Id = product.Id,
            ProductCode = product.ProductCode,
            ProductName = product.ProductName,
            Unit = product.Unit,
            Category = product.Category,
            MRP = product.MRP,
            ImagePath = product.ImagePath,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Create([FromForm] CreateProductDTO dto, IFormFile? image)
    {
        var product = new Product
        {
            ProductCode = await GenerateProductCode(),
            ProductName = dto.ProductName,
            Unit = dto.Unit,
            Category = dto.Category,
            MRP = dto.MRP,
            CreatedAt = DateTime.UtcNow
        };

        if (image != null && image.Length > 0)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "images");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            product.ImagePath = $"/images/{fileName}";
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(new ProductResponseDTO
        {
            Id = product.Id,
            ProductCode = product.ProductCode,
            ProductName = product.ProductName,
            Unit = product.Unit,
            Category = product.Category,
            MRP = product.MRP,
            ImagePath = product.ImagePath,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateProductDTO dto, IFormFile? image)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Product not Found");

        product.ProductName = dto.ProductName;
        product.Unit = dto.Unit;
        product.Category = dto.Category;
        product.MRP = dto.MRP;
        product.IsActive = dto.IsActive;

        if (image != null && image.Length > 0)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "images");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            product.ImagePath = $"/images/{fileName}";
        }

        await _context.SaveChangesAsync();
        return Ok("Product updated successfully.");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Product not found.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok("Product deleted successfully.");
    }
}