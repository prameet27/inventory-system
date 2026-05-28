using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<StockLedger> StockLedgers => Set<StockLedger>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleName = "Admin" },
                new Role { Id = 2, RoleName = "Manager" },
                new Role { Id = 3, RoleName = "Staff" }
            );

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductCode)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .Property(p => p.MRP)
                .HasPrecision(18, 2);

            modelBuilder.Entity<StockLedger>()
                .HasOne(sl => sl.Product)
                .WithMany(p => p.StockLedgers)
                .HasForeignKey(sl => sl.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockLedger>()
                .HasOne(sl => sl.CreatedByUser)
                .WithMany()
                .HasForeignKey(sl => sl.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}