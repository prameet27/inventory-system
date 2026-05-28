import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatToolbarModule,
    MatSidenavModule, MatListModule, MatSnackBarModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header"><mat-icon>inventory_2</mat-icon><span>Inventory</span></div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard"><mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span></a>
          <a mat-list-item routerLink="/products" class="active"><mat-icon matListItemIcon>inventory</mat-icon><span matListItemTitle>Products</span></a>
          <a mat-list-item routerLink="/stock"><mat-icon matListItemIcon>swap_vert</mat-icon><span matListItemTitle>Stock</span></a>
          <a mat-list-item routerLink="/users"><mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Users</span></a>
          <a mat-list-item routerLink="/reports"><mat-icon matListItemIcon>bar_chart</mat-icon><span matListItemTitle>Reports</span></a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Product Management</span>
          <span class="spacer"></span>
          <button mat-raised-button (click)="showForm = !showForm">
            <mat-icon>add</mat-icon> Add Product
          </button>
        </mat-toolbar>

        <div class="content">
          <mat-card *ngIf="showForm" class="form-card">
            <mat-card-header>
              <mat-card-title>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Product Name</mat-label>
                    <input matInput formControlName="productName">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Category</mat-label>
                    <input matInput formControlName="category">
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Unit</mat-label>
                    <input matInput formControlName="unit">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>MRP</mat-label>
                    <input matInput formControlName="mrp" type="number">
                  </mat-form-field>
                </div>
                <div class="image-upload">
                  <label>Product Image</label>
                  <input type="file" (change)="onImageSelect($event)" accept="image/*">
                  <img *ngIf="imagePreview" [src]="imagePreview" class="image-preview">
                </div>
                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit">
                    {{ editingProduct ? 'Update' : 'Create' }}
                  </button>
                  <button mat-button type="button" (click)="cancelForm()">Cancel</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <mat-card class="table-card">
            <mat-card-content>
              <table mat-table [dataSource]="products" class="full-width">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let p">{{ p.productCode }}</td>
                </ng-container>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let p">{{ p.productName }}</td>
                </ng-container>
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let p">{{ p.category }}</td>
                </ng-container>
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>Unit</th>
                  <td mat-cell *matCellDef="let p">{{ p.unit }}</td>
                </ng-container>
                <ng-container matColumnDef="mrp">
                  <th mat-header-cell *matHeaderCellDef>MRP</th>
                  <td mat-cell *matCellDef="let p">₹{{ p.mrp }}</td>
                </ng-container>
                <ng-container matColumnDef="image">
                  <th mat-header-cell *matHeaderCellDef>Image</th>
                  <td mat-cell *matCellDef="let p">
                    <img *ngIf="p.imagePath" [src]="'http://localhost:5169' + p.imagePath"
                      class="product-img" alt="product">
                    <span *ngIf="!p.imagePath">No image</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let p">
                    <button mat-icon-button color="primary" (click)="editProduct(p)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteProduct(p.id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
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
    .form-card { margin-bottom: 24px; border-radius: 12px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .image-upload { margin: 16px 0; }
    .image-upload label { display: block; margin-bottom: 8px; font-weight: 500; }
    .image-preview { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-top: 8px; }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .table-card { border-radius: 12px; }
    .full-width { width: 100%; }
    .product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['code', 'name', 'category', 'unit', 'mrp', 'image', 'actions'];
  showForm = false;
  editingProduct: Product | null = null;
  productForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      unit: ['', Validators.required],
      mrp: ['', Validators.required]
    });
  }

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.productService.getProducts().subscribe(p => {
      this.products = p;
      this.cdr.detectChanges(); 
    });
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.showForm = true;
    this.productForm.patchValue({
      productName: product.productName,
      category: product.category,
      unit: product.unit,
      mrp: product.mrp
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    const formData = new FormData();
    formData.append('productName', this.productForm.value.productName);
    formData.append('category', this.productForm.value.category);
    formData.append('unit', this.productForm.value.unit);
    formData.append('mrp', this.productForm.value.mrp);
    if (this.selectedImage) formData.append('image', this.selectedImage);

    if (this.editingProduct) {
      formData.append('isActive', 'true');
      this.productService.updateProduct(this.editingProduct.id, formData).subscribe({
        next: () => {
          this.snackBar.open('Product updated!', 'Close', { duration: 3000 });
          this.loadProducts(); 
          this.cancelForm();
      },
      error: (err) => {
        if (err.status === 200) {
          this.snackBar.open('Product Updated !', 'close', { duration: 3000 });
          this.loadProducts();
          this.cancelForm();
        } else {
          this.snackBar.open('Error Updating Product', 'close', { duration: 3000 });
        }
      }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (res) => {
        this.snackBar.open('Product created!', 'Close', { duration: 3000 });
        this.loadProducts(); this.cancelForm();
      },
    error: (err) => {
      if (err.status === 200) {
        this.snackBar.open('Product created!', 'Close', { duration: 3000 });
        this.loadProducts();
        this.cancelForm();
      } else {
        this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
      }
    }
    });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
        this.snackBar.open('Product deactivated!', 'Close', { duration: 3000 });
        this.loadProducts();
      },
    error: (err) => {
      if(err.status === 200){
        this.snackBar.open("Product created!", "close", { duration: 3000 });
        this.loadProducts();
      } else {
        this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
      }
    }
    });
    }
  }

  logout(): void { this.authService.logout(); }
}