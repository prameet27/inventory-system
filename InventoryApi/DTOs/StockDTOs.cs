namespace InventoryApi.DTOs;

public class StockTransactionDTO
{
    public int ProductId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Remarks { get; set; }
}

public class StockResponseDTO
{
    public int Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Remarks { get; set; }
    public DateTime TransactionDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class StockSummaryDTO
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public int TotalIn { get; set; }
    public int TotalOut { get; set; }
    public int CurrentStock { get; set; }
}