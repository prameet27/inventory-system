import { Component , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatToolbarModule, MatSidenavModule, MatListModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>inventory_2</mat-icon>
          <span>Inventory</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/stock" routerLinkActive="active">
            <mat-icon matListItemIcon>swap_vert</mat-icon>
            <span matListItemTitle>Stock</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Dashboard</span>
          <span class="spacer"></span>
          <mat-icon>account_circle</mat-icon>
          <span class="username">{{ username }}</span>
        </mat-toolbar>

        <div class="content">
          <div class="stats-grid">
            <mat-card class="stat-card blue">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalProducts }}</div>
                  <div class="stat-label">Total Products</div>
                </div>
                <mat-icon class="stat-icon">inventory</mat-icon>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card green">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalUsers }}</div>
                  <div class="stat-label">Total Users</div>
                </div>
                <mat-icon class="stat-icon">people</mat-icon>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card orange">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalStockIn }}</div>
                  <div class="stat-label">Total Stock In</div>
                </div>
                <mat-icon class="stat-icon">arrow_downward</mat-icon>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card red">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalStockOut }}</div>
                  <div class="stat-label">Total Stock Out</div>
                </div>
                <mat-icon class="stat-icon">arrow_upward</mat-icon>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card class="stock-table-card">
            <mat-card-header>
              <mat-card-title>Stock Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table class="stock-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Stock In</th>
                    <th>Stock Out</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of stockSummary">
                    <td>{{ item.productCode }}</td>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.category }}</td>
                    <td>{{ item.unit }}</td>
                    <td class="text-green">{{ item.totalIn }}</td>
                    <td class="text-red">{{ item.totalOut }}</td>
                    <td><strong>{{ item.currentStock }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav {
      width: 240px;
      background: #1a237e;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .sidenav mat-nav-list a {
      color: rgba(255,255,255,0.8);
      margin: 4px 8px;
      border-radius: 8px;
    }
    .sidenav mat-nav-list a.active,
    .sidenav mat-nav-list a:hover { background: rgba(255,255,255,0.2); color: white; }
    .sidenav-footer { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.2); }
    .logout-btn { color: white; width: 100%; }
    .spacer { flex: 1; }
    .username { margin-left: 8px; font-size: 14px; }
    .content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
    }
    .stat-number { font-size: 36px; font-weight: bold; color: white; }
    .stat-label { font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 4px; }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(255,255,255,0.5); }
    .blue { background: linear-gradient(135deg, #1976d2, #42a5f5); }
    .green { background: linear-gradient(135deg, #388e3c, #66bb6a); }
    .orange { background: linear-gradient(135deg, #f57c00, #ffa726); }
    .red { background: linear-gradient(135deg, #d32f2f, #ef5350); }
    .stock-table-card { border-radius: 12px; }
    .stock-table { width: 100%; border-collapse: collapse; }
    .stock-table th {
      background: #f5f5f5;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }
    .stock-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
    .stock-table tr:hover { background: #fafafa; }
    .text-green { color: #388e3c; font-weight: 500; }
    .text-red { color: #d32f2f; font-weight: 500; }
  `]
})
export class DashboardComponent {
  totalProducts = 0;
  totalUsers = 0;
  totalStockIn = 0;
  totalStockOut = 0;
  stockSummary: any[] = [];
  username = '';

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.username = this.authService.getCurrentUser()?.username ?? '';
    this.loadData();
  }

  loadData(): void {
    this.productService.getProducts().subscribe(p => {
      this.totalProducts = p.length;
      this.cdr.detectChanges();
    });
    this.userService.getUsers().subscribe(u => {
      this.totalUsers = u.length;
      this.cdr.detectChanges();
    });
    this.stockService.getStockSummary().subscribe(s => {
      this.stockSummary = s;
      this.totalStockIn = s.reduce((sum, i) => sum + i.totalIn, 0);
      this.totalStockOut = s.reduce((sum, i) => sum + i.totalOut, 0);
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
  }
}