import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    _id: string;
    name: string;
    email: string;
    // Ajoutez d'autres propriétés utilisateur si nécessaire (ex: avatar)
    avatar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`; // Ajustez cette URL si votre endpoint utilisateur est différent

    constructor(private http: HttpClient) { }

    getUser(userId: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${userId}`);
    }

    // Nouvelle méthode pour rechercher des utilisateurs
    searchUsers(query: string): Observable<User[]> {
        // Assurez-vous que votre backend a un endpoint pour la recherche d'utilisateurs
        return this.http.get<User[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
    }
} 