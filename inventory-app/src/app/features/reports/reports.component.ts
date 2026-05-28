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
import { StockService } from '../../core/services/stock.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatDatepickerModule, MatNativeDateModule
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
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Stock Reports</span>
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
                  <td mat-cell *matCellDef="let r">{{ r.createdBy }}</td>
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
    .content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }
    .filter-card { margin-bottom: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .form-actions { display: flex; gap: 8px; }
    .full-width { width: 100%; }
    .badge-in { background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .badge-out { background: #ffebee; color: #c62828; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .no-data { display: flex; align-items: center; gap: 8px; padding: 24px; color: #9e9e9e; justify-content: center; }
  `]
})
export class ReportsComponent implements OnInit {
  reportData: any[] = [];
  columns = ['date', 'code', 'product', 'type', 'qty', 'remarks', 'by'];
  filterForm: FormGroup;

  constructor(
    private stockService: StockService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({ from: [''], to: [''], category: [''] });
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

  logout(): void { this.authService.logout(); }
}