import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  performedBy?: string;
  action?: string;
  itemName?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private isConnected = false;
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = new BehaviorSubject<number>(0);

  startConnection(): void {
    // Already connected — nothing to do
    if (this.isConnected) return;

    // Always read the token fresh from localStorage so SignalR
    // never uses a stale snapshot (fixes the 401 on reconnect)
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5169/hubs/notification', {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (notification: AppNotification) => {
      const current = this.notificationsSubject.value;
      const updated = [{ ...notification, read: false }, ...current].slice(0, 50);
      this.notificationsSubject.next(updated);
      this.unreadCount$.next(updated.filter(n => !n.read).length);
    });

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        this.isConnected = true;
      })
      .catch(err => console.error('SignalR error:', err));
  }

  markAllRead(): void {
    const updated = this.notificationsSubject.value.map((n: AppNotification) => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.unreadCount$.next(0);
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    // Always reset so startConnection() can run cleanly next login
    this.isConnected = false;
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCount$.next(0);
  }
}