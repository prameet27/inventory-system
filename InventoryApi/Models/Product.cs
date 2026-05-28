namespace InventoryApi.Models{
    public class Product{
        public int Id{get; set;}
        public string ProductCode{get; set;} = string.Empty;
        public string ProductName{get; set;} = string.Empty;
        public string Unit{get; set;} = string.Empty;
        public string Category{get; set;} = string.Empty;
        public decimal MRP{get; set;}
        public string? ImagePath{get; set;}
        public bool IsActive{ get; set;} = true;
        public DateTime CreatedAt{get; set;} = DateTime.UtcNow;

        public ICollection<StockLedger> StockLedgers {get; set;} = new List<StockLedger>();
    }
}