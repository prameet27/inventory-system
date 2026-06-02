using InventoryApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace InventoryApi.Services;

public class NotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task NotifyAll(string message, string type, string performedBy, string action, string itemname)
    {
        await _hub.Clients.All.SendAsync("ReceiveNotification", new
        {
            message,
            type,
            timestamp = DateTime.UtcNow,
            performedBy,
            action,
            itemName = itemname   // ✅ renamed to match frontend AppNotification interface
        });
    }

    public async Task NotifyRole(string role, string message, string type, string performedBy, string action, string itemname)
    {
        await _hub.Clients.Group(role).SendAsync("ReceiveNotification", new
        {
            message,
            type,
            timestamp = DateTime.UtcNow,
            performedBy,
            action,
            itemName = itemname   // ✅ fixed — was referencing undefined variable itemName
        });
    }
}