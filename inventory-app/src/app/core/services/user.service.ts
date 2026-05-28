import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5169/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/Users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/Users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Users`, user, { responseType: 'text' });
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Users/${id}`, user, { responseType: 'text' });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${id}`, { responseType: 'text' });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/Roles`);
  }
}