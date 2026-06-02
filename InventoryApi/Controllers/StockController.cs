using System.Security.Claims;
using InventoryApi.Data;
using InventoryApi.DTOs;
using InventoryApi.Models;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notify;

    public StockController(AppDbContext context, NotificationService notify)
    {
        _context = context;
        _notify = notify;
    }

    [HttpPost("transaction")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> AddTransaction(StockTransactionDTO dto)
    {
        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound("Product not found.");

        if (dto.TransactionType != "IN" && dto.TransactionType != "OUT")
            return BadRequest("TransactionType must be 'IN' or 'OUT'.");

        if (dto.Quantity <= 0)
            return BadRequest("Quantity must be greater than zero.");

        if (dto.TransactionType == "OUT")
        {
            var currentStock = await GetCurrentStock(dto.ProductId);
            if (currentStock < dto.Quantity)
                return BadRequest($"Insufficient stock. Current stock: {currentStock}");
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var transaction = new StockLedger
        {
            ProductId = dto.ProductId,
            TransactionType = dto.TransactionType,
            Quantity = dto.Quantity,
            Remarks = dto.Remarks,
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        _context.StockLedgers.Add(transaction);
        await _context.SaveChangesAsync();

        var msg = dto.TransactionType == "IN"
            ? $" STOCK IN : {product.ProductName} + {dto.Quantity} units"
            : $" STOCK OUT : {product.ProductName} - {dto.Quantity} units";

        var type = dto.TransactionType == "IN" ? "success": "warning";
        await _notify.NotifyRole("Admin", msg, type,
            User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Unknown",
            dto.TransactionType == "IN" ? "Stock IN" : "Stock OUT",
            product.ProductName);
        await _notify.NotifyRole("Manager", msg, type,
        User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Unknown", 
            dto.TransactionType == "IN" ? "Stock IN" : "Stock OUT",
            product.ProductName);
        return Ok("Stock transaction recorded successfully.");
    }
 
    [HttpGet("summary")]
    public async Task<IActionResult> GetStockSummary()
    {
        var products = await _context.Products
            .Where(p => p.IsActive)
            .ToListAsync();

        var summary = new List<StockSummaryDTO>();

        foreach (var product in products)
        {
            var ledgers = await _context.StockLedgers
                .Where(s => s.ProductId == product.Id)
                .ToListAsync();

            var totalIn = ledgers.Where(s => s.TransactionType == "IN").Sum(s => s.Quantity);
            var totalOut = ledgers.Where(s => s.TransactionType == "OUT").Sum(s => s.Quantity);

            summary.Add(new StockSummaryDTO
            {
                ProductId = product.Id,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,
                Unit = product.Unit,
                Category = product.Category,
                MRP = product.MRP,
                TotalIn = totalIn,
                TotalOut = totalOut,
                CurrentStock = totalIn - totalOut
            });
        }

        return Ok(summary);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions()
    {
        var transactions = await _context.StockLedgers
            .Include(s => s.Product)
            .Include(s => s.CreatedByUser)
            .OrderByDescending(s => s.TransactionDate)
            .Select(s => new StockResponseDTO
            {
                Id = s.Id,
                ProductCode = s.Product.ProductCode,
                ProductName = s.Product.ProductName,
                TransactionType = s.TransactionType,
                Quantity = s.Quantity,
                Remarks = s.Remarks,
                TransactionDate = s.TransactionDate,
                CreatedBy = s.CreatedByUser.Username
            }).ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("transactions/{productId}")]
    public async Task<IActionResult> GetTransactionsByProduct(int productId)
    {
        var transactions = await _context.StockLedgers
            .Include(s => s.Product)
            .Include(s => s.CreatedByUser)
            .Where(s => s.ProductId == productId)
            .OrderByDescending(s => s.TransactionDate)
            .Select(s => new StockResponseDTO
            {
                Id = s.Id,
                ProductCode = s.Product.ProductCode,
                ProductName = s.Product.ProductName,
                TransactionType = s.TransactionType,
                Quantity = s.Quantity,
                Remarks = s.Remarks,
                TransactionDate = s.TransactionDate,
                CreatedBy = s.CreatedByUser.Username
            }).ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("report")]
    public async Task<IActionResult> GetStockReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? category)
    {
        var query = _context.StockLedgers
            .Include(s => s.Product)
            .Include(s => s.CreatedByUser)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(s => s.TransactionDate >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.TransactionDate <= to.Value);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(s => s.Product.Category == category);

        var result = await query
            .OrderByDescending(s => s.TransactionDate)
            .Select(s => new StockResponseDTO
            {
                Id = s.Id,
                ProductCode = s.Product.ProductCode,
                ProductName = s.Product.ProductName,
                TransactionType = s.TransactionType,
                Quantity = s.Quantity,
                Remarks = s.Remarks,
                TransactionDate = s.TransactionDate,
                CreatedBy = s.CreatedByUser.Username
            }).ToListAsync();

        return Ok(result);
    }

    private async Task<int> GetCurrentStock(int productId)
    {
        var ledgers = await _context.StockLedgers
            .Where(s => s.ProductId == productId)
            .ToListAsync();

        var totalIn = ledgers.Where(s => s.TransactionType == "IN").Sum(s => s.Quantity);
        var totalOut = ledgers.Where(s => s.TransactionType == "OUT").Sum(s => s.Quantity);

        return totalIn - totalOut;
    }
}