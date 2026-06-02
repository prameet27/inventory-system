import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { StockService } from '../../core/services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatDatepickerModule, MatNativeDateModule, MatBadgeModule, MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header"><mat-icon>inventory_2</mat-icon><span>Inventory</span></div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard"><mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span></a>
          <a mat-list-item routerLink="/products"><mat-icon matListItemIcon>inventory</mat-icon><span matListItemTitle>Products</span></a>
          <a mat-list-item routerLink="/stock"><mat-icon matListItemIcon>swap_vert</mat-icon><span matListItemTitle>Stock</span></a>
          <a mat-list-item routerLink="/users"><mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Users</span></a>
          <a mat-list-item routerLink="/reports" class="active"><mat-icon matListItemIcon>bar_chart</mat-icon><span matListItemTitle>Reports</span></a>
          <a mat-list-item routerLink="/notifications"><mat-icon matListItemIcon>notifications</mat-icon><span matListItemTitle>Notifications</span></a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Reports</span>
          <span class="spacer"></span>

          <!-- Notification Bell -->
          <button mat-icon-button [matMenuTriggerFor]="notifMenu" (click)="markAllRead()">
            <mat-icon [matBadge]="unreadCount" matBadgeColor="warn"
              [matBadgeHidden]="unreadCount === 0">notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu">
            <div class="notif-header">
              <mat-icon>notifications</mat-icon> Notifications
              <span class="notif-count" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">
              <mat-icon>notifications_none</mat-icon><span>No notifications</span>
            </div>
            <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read">
              <div class="notif-item-icon" [class]="'icon-' + n.type">
                <mat-icon>{{ getIcon(n.type) }}</mat-icon>
              </div>
              <div class="notif-item-body">
                <div class="notif-item-top">
                  <span class="notif-action-chip" [class]="'chip-' + n.type">{{ n.action }}</span>
                  <span class="notif-item-time">{{ n.timestamp | date:'shortTime' }}</span>
                </div>
                <div class="notif-item-name" *ngIf="n.itemName">{{ n.itemName }}</div>
                <div class="notif-item-msg">{{ n.message }}</div>
                <div class="notif-item-by" *ngIf="n.performedBy">
                  <mat-icon>person</mat-icon><span>{{ n.performedBy }}</span>
                </div>
              </div>
            </div>
            <div class="notif-footer" *ngIf="notifications.length > 0">
              <a routerLink="/notifications" mat-button color="primary">View all</a>
            </div>
          </mat-menu>
        </mat-toolbar>

        <div class="content">
          <mat-card class="filter-card">
            <mat-card-header><mat-card-title>Filter Report</mat-card-title></mat-card-header>
            <mat-card-content>
              <form [formGroup]="filterForm" (ngSubmit)="loadReport()">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>From Date</mat-label>
                    <input matInput [matDatepicker]="fromPicker" formControlName="from">
                    <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                    <mat-datepicker #fromPicker></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>To Date</mat-label>
                    <input matInput [matDatepicker]="toPicker" formControlName="to">
                    <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                    <mat-datepicker #toPicker></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Category</mat-label>
                    <input matInput formControlName="category" placeholder="e.g. Grocery">
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit">
                    <mat-icon>search</mat-icon> Generate Report
                  </button>
                  <button mat-button type="button" (click)="clearFilter()">Clear</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Report Results ({{ reportData.length }} records)</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="reportData" class="full-width">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let r">{{ r.transactionDate | date:'medium' }}</td>
                </ng-container>
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let r">{{ r.productCode }}</td>
                </ng-container>
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let r">{{ r.productName }}</td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let r">
                    <span [class]="r.transactionType === 'IN' ? 'badge-in' : 'badge-out'">
                      {{ r.transactionType }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="qty">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let r">{{ r.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="remarks">
                  <th mat-header-cell *matHeaderCellDef>Remarks</th>
                  <td mat-cell *matCellDef="let r">{{ r.remarks }}</td>
                </ng-container>
                <ng-container matColumnDef="by">
                  <th mat-header-cell *matHeaderCellDef>By</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="by-chip"><mat-icon>person</mat-icon>{{ r.createdBy }}</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              </table>
              <div *ngIf="reportData.length === 0" class="no-data">
                <mat-icon>info</mat-icon> No records found
              </div>
            </mat-card-content>
          </mat-card>
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
    .filter-card { margin-bottom: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .form-actions { display: flex; gap: 8px; }
    .full-width { width: 100%; }
    .badge-in  { background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .badge-out { background: #ffebee; color: #c62828; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .no-data { display: flex; align-items: center; gap: 8px; padding: 24px; color: #9e9e9e; justify-content: center; }
    .by-chip { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: #616161; }
    .by-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }

    /* Notification dropdown */
    .notif-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #eee; min-width: 320px; }
    .notif-count { margin-left: auto; background: #1976d2; color: white; border-radius: 12px; padding: 1px 8px; font-size: 12px; }
    .notif-empty { display: flex; align-items: center; gap: 8px; padding: 20px 16px; color: #9e9e9e; font-size: 13px; }
    .notif-item { display: flex; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; cursor: default; }
    .notif-item.unread { background: #f8f9ff; }
    .notif-item-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .notif-item-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .icon-success { background: #e8f5e9; color: #388e3c; }
    .icon-info    { background: #e3f2fd; color: #1976d2; }
    .icon-warning { background: #fff3e0; color: #f57c00; }
    .icon-error   { background: #ffebee; color: #d32f2f; }
    .notif-item-body { flex: 1; overflow: hidden; }
    .notif-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .notif-action-chip { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px; }
    .chip-success { background: #e8f5e9; color: #2e7d32; }
    .chip-info    { background: #e3f2fd; color: #1565c0; }
    .chip-warning { background: #fff3e0; color: #e65100; }
    .chip-error   { background: #ffebee; color: #c62828; }
    .notif-item-time { font-size: 11px; color: #bdbdbd; }
    .notif-item-name { font-size: 13px; font-weight: 600; color: #212121; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-msg  { font-size: 12px; color: #616161; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-by   { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #9e9e9e; margin-top: 3px; }
    .notif-item-by mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .notif-footer { padding: 8px 16px; border-top: 1px solid #eee; text-align: center; }
  `]
})
export class ReportsComponent implements OnInit {
  reportData: any[] = [];
  columns = ['date', 'code', 'product', 'type', 'qty', 'remarks', 'by'];
  filterForm: FormGroup;
  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(
    private stockService: StockService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    this.filterForm = this.fb.group({ from: [''], to: [''], category: [''] });

    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
      this.cdr.markForCheck();
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    const { from, to, category } = this.filterForm.value;
    this.stockService.getStockReport(
      from ? new Date(from).toISOString() : undefined,
      to ? new Date(to).toISOString() : undefined,
      category || undefined
    ).subscribe(r => {
      this.reportData = r;
      this.cdr.detectChanges();
    });
  }

  clearFilter(): void {
    this.filterForm.reset();
    this.loadReport();
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
  logout(): void      { this.authService.logout(); }
}