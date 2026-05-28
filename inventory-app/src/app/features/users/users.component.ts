import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatToolbarModule, MatSidenavModule, MatListModule, MatSnackBarModule,
    MatChipsModule
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
          <a mat-list-item routerLink="/users" class="active"><mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Users</span></a>
          <a mat-list-item routerLink="/reports"><mat-icon matListItemIcon>bar_chart</mat-icon><span matListItemTitle>Reports</span></a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>User Management</span>
          <span class="spacer"></span>
          <button mat-raised-button (click)="showForm = !showForm">
            <mat-icon>add</mat-icon> Add User
          </button>
        </mat-toolbar>

        <div class="content">
          <mat-card *ngIf="showForm" class="form-card">
            <mat-card-header>
              <mat-card-title>{{ editingUser ? 'Edit User' : 'Create New User' }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email">
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline" *ngIf="!editingUser">
                    <mat-label>Password</mat-label>
                    <input matInput formControlName="password" type="password">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Role</mat-label>
                    <mat-select formControlName="roleId">
                      <mat-option *ngFor="let role of roles" [value]="role.id">
                        {{ role.roleName }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit">
                    {{ editingUser ? 'Update' : 'Create' }}
                  </button>
                  <button mat-button type="button" (click)="cancelForm()">Cancel</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <mat-card class="table-card">
            <mat-card-content>
              <table mat-table [dataSource]="dataSource" class="full-width">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let u">{{ u.id }}</td>
                </ng-container>
                <ng-container matColumnDef="username">
                  <th mat-header-cell *matHeaderCellDef>Username</th>
                  <td mat-cell *matCellDef="let u">{{ u.username }}</td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let u">{{ u.email }}</td>
                </ng-container>
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let u">
                    <span class="role-badge" [class]="'role-' + u.role.toLowerCase()">{{ u.role }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let u">
                    <span [class]="u.isActive ? 'status-active' : 'status-inactive'">
                      {{ u.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let u">
                    <button mat-icon-button color="primary" (click)="editUser(u)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteUser(u.id)">
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
    .form-actions { display: flex; gap: 8px; margin-top: 8px; }
    .table-card { border-radius: 12px; }
    .full-width { width: 100%; }
    .role-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .role-admin { background: #e3f2fd; color: #1565c0; }
    .role-manager { background: #e8f5e9; color: #2e7d32; }
    .role-staff { background: #fff3e0; color: #e65100; }
    .status-active { color: #388e3c; font-weight: 500; }
    .status-inactive { color: #d32f2f; font-weight: 500; }
  `]
})
export class UsersComponent implements OnInit {
  dataSource = new MatTableDataSource<User>([]);
  roles: Role[] = [];
  displayedColumns = ['id', 'username', 'email', 'role', 'status', 'actions'];
  showForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(u => {
      this.dataSource.data = u;
      this.cdr.detectChanges();
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(r => {
      this.roles = r;
      this.cdr.detectChanges();
    });
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.showForm = true;
    this.userForm.patchValue({ username: user.username, email: user.email });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, {
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          roleId: this.userForm.value.roleId,
          isActive: true
      }).subscribe({ 
          next: () => {
              this.snackBar.open('User Updated!', 'Close', { duration: 3000 });
              this.loadUsers();
              this.cancelForm();
          },
          error: (err) => {
              if (err.status === 200){
                  this.snackBar.open('User Updated!', 'Close', {duration: 3000 });
                  this.loadUsers();
                  this.cancelForm();
              } else {
                this.snackBar.open('Error updating user', 'close', { duration: 3000 });
              }
            }
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
          next: () => {
        this.snackBar.open('User created!', 'Close', { duration: 3000 });
        this.loadUsers();
        this.cancelForm();
      },
      error: (err) => {
        if (err.status === 200) {
          this.snackBar.open('User Created!', 'Close', { duration: 3000 });
          this.loadUsers();
          this.cancelForm();
        } else {
          this.snackBar.open('Error creating User', 'Close', { duration: 3000 });
        }
      }
      });
    }
  }

  deleteUser(id: number): void {
  if (confirm('Are you sure you want to delete this user?')) {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(u => u.id !== id);
        this.cdr.detectChanges();
        this.snackBar.open('User deleted!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.status === 200) {
          this.dataSource.data = this.dataSource.data.filter(u => u.id !== id);
          this.cdr.detectChanges();
          this.snackBar.open('User deleted!', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Error: ' + err.message, 'Close', { duration: 3000 });
        }
      }
    });
  }
}

  logout(): void { this.authService.logout(); }
}