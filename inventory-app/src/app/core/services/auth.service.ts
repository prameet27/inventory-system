import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:5169/api/Auth';
    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    currentUser$: Observable<AuthResponse | null> = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router){
        const stored = localStorage.getItem('currentUser');
        if (stored){
            this.currentUserSubject.next(JSON.parse(stored));
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('currentUser', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                this.currentUserSubject.next(response);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    getUserRole(): string{
        return this.currentUserSubject.value?.role ?? '';
    }
}