import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models/user.model';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatSnackBarModule, MatBadgeModule, MatMenuModule
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
          <a mat-list-item routerLink="/notifications"><mat-icon matListItemIcon>notifications</mat-icon><span matListItemTitle>Notifications</span></a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn"><mat-icon>logout</mat-icon> Logout</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>User Management</span>
          <span class="spacer"></span>

          <!-- Notification Bell -->
          <button mat-icon-button [matMenuTriggerFor]="notifMenu" (click)="markAllRead()">
            <mat-icon [matBadge]="unreadCount" matBadgeColor="warn"
              [matBadgeHidden]="unreadCount === 0">notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu" class="notif-menu-panel">
            <div class="notif-header">
              <mat-icon>notifications</mat-icon> Notifications
              <span class="notif-count" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">
              <mat-icon>notifications_none</mat-icon>
              <span>No notifications</span>
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

          <button mat-raised-button (click)="toggleForm()">
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
              <table mat-table [dataSource]="users" class="full-width">
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
    .role-admin   { background: #e3f2fd; color: #1565c0; }
    .role-manager { background: #e8f5e9; color: #2e7d32; }
    .role-staff   { background: #fff3e0; color: #e65100; }

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
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  displayedColumns = ['id', 'username', 'email', 'role', 'actions'];
  showForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;
  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleId: ['', Validators.required]
    });

    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
      this.cdr.markForCheck();
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelForm();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(u => {
      this.users = u;
      this.cdr.markForCheck();
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(r => this.roles = r);
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.showForm = true;
    this.userForm.patchValue({ username: user.username, email: user.email, roleId: user.role });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
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
        next: () => { this.snackBar.open('User updated!', 'Close', { duration: 3000 }); this.loadUsers(); this.cancelForm(); },
        error: (err) => { if (err.status === 200) { this.snackBar.open('User updated!', 'Close', { duration: 3000 }); this.loadUsers(); this.cancelForm(); } }
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => { this.snackBar.open('User created!', 'Close', { duration: 3000 }); this.loadUsers(); this.cancelForm(); },
        error: (err) => { if (err.status === 200) { this.snackBar.open('User created!', 'Close', { duration: 3000 }); this.loadUsers(); this.cancelForm(); } }
      });
    }
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.cdr.markForCheck();
        this.snackBar.open('User deleted!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.status === 200) {
          this.users = this.users.filter(u => u.id !== id);
          this.cdr.markForCheck();
          this.snackBar.open('User deleted!', 'Close', { duration: 3000 });
        }
      }
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
  logout(): void      { this.authService.logout(); }
}