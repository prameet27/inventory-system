namespace InventoryApi.Models{
    public class StockLedger{
        public int Id{get; set;}
        public int ProductId{get; set;}
        public Product Product{get; set;} = null!;

        public string TransactionType{get; set;} = string.Empty; // "IN" or "OUT"
        public int Quantity{get; set;}
        public string? Remarks{get; set;}
        public DateTime TransactionDate{get; set;} = DateTime.UtcNow;       

        public int CreatedByUserId{get; set;}
        public User CreatedByUser{get; set;}  = null!;        
    }
}