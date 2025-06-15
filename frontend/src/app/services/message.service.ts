import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    receiver: {
        _id: string;
        name: string;
        email: string;
    };
    post: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
    content: string;
    read: boolean;
    createdAt: string;
    attachments?: {
        type: 'image' | 'file';
        url: string;
        name: string;
    }[];
    status?: 'pending' | 'accepted' | 'rejected';
    offer?: {
        price: number;
        message: string;
    };
}

export interface Conversation {
    post: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
    buyer: {
        _id: string;
        name: string;
        avatar?: string;
    };
    seller: {
        _id: string;
        name: string;
        avatar?: string;
    };
    lastMessage?: Message;
    unreadCount: number;
    status: 'active' | 'archived' | 'blocked';
    lastActivity: Date;
    tags?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private apiUrl = `${environment.apiUrl}/messages`;
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUnreadCount();
    }

    // Envoyer un message
    sendMessage(receiverId: string, postId: string, content: string, attachments?: File[]): Observable<Message> {
        const formData = new FormData();
        formData.append('receiverId', receiverId);
        formData.append('postId', postId);
        formData.append('content', content);

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Frontend - Envoi message:');
        console.log('receiverId:', receiverId);
        console.log('postId:', postId);
        console.log('content:', content);
        console.log('Attachments:', attachments);
        // *****************************

        if (attachments) {
            attachments.forEach(file => formData.append('attachments', file));
        }
        return this.http.post<Message>(this.apiUrl, {
            receiverId,
            postId,
            content
        });
    }

    // Obtenir une conversation spécifique
    getConversation(postId: string, userId: string): Observable<Message[]> {
        return this.http.get<Message[]>(`${this.apiUrl}/${postId}/${userId}`);
    }

    // Obtenir toutes les conversations
    getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(this.apiUrl).pipe(
            map(conversations => {
                let totalUnread = 0;
                conversations.forEach(conv => {
                    totalUnread += conv.unreadCount;
                });
                this.unreadCountSubject.next(totalUnread);
                return conversations;
            })
        );
    }

    // Marquer un message comme lu
    markAsRead(messageId: string): Observable<Message> {
        return this.http.put<Message>(`${this.apiUrl}/${messageId}/read`, {});
    }

    // Archiver une conversation
    archiveConversation(postId: string, userId: string): Observable<Conversation> {
        return this.http.put<Conversation>(`${this.apiUrl}/${postId}/${userId}/archive`, {});
    }

    // Bloquer un utilisateur
    blockUser(userId: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/block/${userId}`, {});
    }

    // Faire une offre sur un article
    makeOffer(postId: string, sellerId: string, price: number, message: string): Observable<Message> {
        return this.http.post<Message>(`${this.apiUrl}/offer`, {
            postId,
            sellerId,
            price,
            message
        });
    }

    // Accepter/Rejeter une offre
    respondToOffer(messageId: string, accept: boolean): Observable<Message> {
        return this.http.put<Message>(`${this.apiUrl}/offer/${messageId}`, {
            status: accept ? 'accepted' : 'rejected'
        });
    }

    // Ajouter des tags à une conversation
    addTags(postId: string, userId: string, tags: string[]): Observable<Conversation> {
        return this.http.put<Conversation>(`${this.apiUrl}/${postId}/${userId}/tags`, { tags });
    }

    // Rechercher dans les messages
    searchMessages(query: string): Observable<Message[]> {
        return this.http.get<Message[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
    }

    // Obtenir les statistiques des conversations
    getConversationStats(): Observable<{
        total: number;
        unread: number;
        archived: number;
        blocked: number;
    }> {
        return this.http.get<{
            total: number;
            unread: number;
            archived: number;
            blocked: number;
        }>(`${this.apiUrl}/stats`);
    }

    private loadUnreadCount(): void {
        this.getConversations().subscribe();
    }
} 