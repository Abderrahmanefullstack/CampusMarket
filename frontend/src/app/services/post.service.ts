import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

export interface Post {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: 'books' | 'supplies';
    condition: 'new' | 'used' | 'like-new';
    images: string[];
    location: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private apiUrl = `${environment.apiUrl}/posts`;

    constructor(private http: HttpClient) { }

    getAllPosts(): Observable<Post[]> {
        return this.http.get<Post[]>(this.apiUrl);
    }

    getPost(id: string): Observable<Post> {
        return this.http.get<Post>(`${this.apiUrl}/${id}`);
    }

    createPost(formData: FormData): Observable<Post> {
        const token = localStorage.getItem('token');
        if (!token) {
            return throwError(() => new Error('Non authentifié'));
        }

        return this.http.post<Post>(this.apiUrl, formData)
            .pipe(
                catchError(error => {
                    console.error('Erreur dans createPost:', error);
                    return throwError(() => error);
                })
            );
    }

    updatePost(id: string, formData: FormData): Observable<Post> {
        return this.http.put<Post>(`${this.apiUrl}/${id}`, formData);
    }

    deletePost(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 