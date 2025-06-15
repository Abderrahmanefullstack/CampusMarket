import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Define an interface for the expected backend response
interface AuthResponse {
    token: string;
    user: { // Adjust this interface to match your backend's user structure
        _id: string;
        name: string;
        email: string;
        // Add other user properties here
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

    signup(name: string, email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password }).pipe(
            tap(response => {
                if (response.token && response.user) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
            })
        );
    }

    signin(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, { email, password }).pipe(
            tap(response => {
                if (response.token && response.user) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
} 