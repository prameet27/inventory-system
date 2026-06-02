import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatToolbarModule, MatSidenavModule,
    MatListModule, MatBadgeModule, MatChipsModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>inventory_2</mat-icon>
          <span>Inventory</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard"><mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span></a>
          <a mat-list-item routerLink="/products"><mat-icon matListItemIcon>inventory</mat-icon><span matListItemTitle>Products</span></a>
          <a mat-list-item routerLink="/stock"><mat-icon matListItemIcon>swap_vert</mat-icon><span matListItemTitle>Stock</span></a>
          <a mat-list-item routerLink="/users"><mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Users</span></a>
          <a mat-list-item routerLink="/reports"><mat-icon matListItemIcon>bar_chart</mat-icon><span matListItemTitle>Reports</span></a>
          <a mat-list-item routerLink="/notifications" class="active">
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Notifications</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Notifications</span>
          <span class="spacer"></span>
          <button mat-button (click)="markAllRead()" *ngIf="unreadCount > 0">
            <mat-icon>done_all</mat-icon> Mark all read
          </button>
          <button mat-button (click)="clearAll()" *ngIf="notifications.length > 0">
            <mat-icon>delete_sweep</mat-icon> Clear all
          </button>
        </mat-toolbar>

        <div class="content">
          <!-- Summary bar -->
          <div class="summary-bar" *ngIf="notifications.length > 0">
            <span class="summary-chip chip-total">
              <mat-icon>notifications</mat-icon> {{ notifications.length }} Total
            </span>
            <span class="summary-chip chip-unread" *ngIf="unreadCount > 0">
              <mat-icon>fiber_manual_record</mat-icon> {{ unreadCount }} Unread
            </span>
          </div>

          <div *ngIf="notifications.length === 0" class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <h3>No notifications yet</h3>
            <p>You'll see here who created, updated, added or deleted users, products and stock.</p>
          </div>

          <div *ngFor="let n of notifications" class="notif-card" [class.unread]="!n.read">
            <div class="notif-icon" [class]="'icon-bg-' + n.type">
              <mat-icon>{{ getIcon(n.type) }}</mat-icon>
            </div>
            <div class="notif-body">
              <div class="notif-top">
                <span class="notif-action" [class]="'chip-' + n.type">{{ n.action }}</span>
                <span class="notif-time">{{ n.timestamp | date:'MMM d, y, h:mm a' }}</span>
              </div>
              <div class="notif-item-name" *ngIf="n.itemName">{{ n.itemName }}</div>
              <div class="notif-message">{{ n.message }}</div>
              <div class="notif-by" *ngIf="n.performedBy">
                <mat-icon>person</mat-icon>
                <span><strong>{{ n.performedBy }}</strong></span>
              </div>
            </div>
            <div *ngIf="!n.read" class="unread-dot"></div>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #1a237e; color: white; display: flex; flex-direction: column; }
    .sidenav-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px; font-size: 20px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .sidenav mat-nav-list a { color: rgba(255,255,255,0.8); margin: 4px 8px; border-radius: 8px; }
    .sidenav mat-nav-list a.active, .sidenav mat-nav-list a:hover { background: rgba(255,255,255,0.2); color: white; }
    .sidenav-footer { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.2); }
    .logout-btn { color: white; width: 100%; }
    .spacer { flex: 1; }
    .content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }

    .summary-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .summary-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .summary-chip mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .chip-total { background: #e3f2fd; color: #1565c0; }
    .chip-unread { background: #fff3e0; color: #e65100; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px 20px; color: #9e9e9e;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; margin: 0 0 8px; }
    .empty-state p { font-size: 14px; text-align: center; }

    .notif-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: white; border-radius: 12px; padding: 16px;
      margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: relative; transition: all 0.2s;
    }
    .notif-card.unread { border-left: 4px solid #1976d2; background: #f8f9ff; }
    .notif-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

    .notif-icon {
      width: 48px; height: 48px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .icon-bg-success { background: #e8f5e9; color: #388e3c; }
    .icon-bg-info    { background: #e3f2fd; color: #1976d2; }
    .icon-bg-warning { background: #fff3e0; color: #f57c00; }
    .icon-bg-error   { background: #ffebee; color: #d32f2f; }

    .notif-body { flex: 1; }
    .notif-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .notif-action {
      padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
    }
    .chip-success { background: #e8f5e9; color: #2e7d32; }
    .chip-info    { background: #e3f2fd; color: #1565c0; }
    .chip-warning { background: #fff3e0; color: #e65100; }
    .chip-error   { background: #ffebee; color: #c62828; }

    .notif-time     { font-size: 12px; color: #9e9e9e; }
    .notif-item-name { font-size: 16px; font-weight: 600; color: #212121; margin-bottom: 4px; }
    .notif-message  { font-size: 13px; color: #616161; margin-bottom: 8px; }
    .notif-by {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: #757575;
      background: #f5f5f5; padding: 3px 8px; border-radius: 20px;
    }
    .notif-by mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .unread-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #1976d2; flex-shrink: 0; margin-top: 4px;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(n => {
      setTimeout(() => {
        this.notifications = n;
        this.cdr.detectChanges();
      });
    });
    this.notificationService.unreadCount$.subscribe(count => {
      setTimeout(() => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      });
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error':   return 'error';
      default:        return 'info';
    }
  }

  markAllRead(): void { this.notificationService.markAllRead(); }
  clearAll(): void    { this.notificationService.clearAll(); }
  logout(): void      { this.authService.logout(); }
}