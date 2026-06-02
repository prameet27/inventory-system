import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // On app boot: if a token already exists (page refresh), connect immediately
    if (this.authService.isLoggedIn()) {
      this.notificationService.startConnection();
    }

    // On login: connect. On logout: disconnect.
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.notificationService.startConnection();
      } else {
        this.notificationService.stopConnection();
      }
    });
  }
}