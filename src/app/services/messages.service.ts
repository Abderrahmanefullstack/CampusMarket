import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
    constructor(private apollo: Apollo) { }

    getMessages(userId: string): Observable<Message[]> {
        return this.apollo.watchQuery<{ messages: Message[] }>({
            query: gql`
        query Messages($userId: String!) {
          messages(userId: $userId) {
            id
            senderId
            receiverId
            content
            read
            createdAt
            updatedAt
          }
        }
      `,
            variables: { userId }
        }).valueChanges.pipe(map(result => result.data.messages));
    }

    sendMessage(senderId: string, receiverId: string, content: string): Observable<Message> {
        return this.apollo.mutate<{ sendMessage: Message }>({
            mutation: gql`
        mutation SendMessage($senderId: String!, $receiverId: String!, $content: String!) {
          sendMessage(senderId: $senderId, receiverId: $receiverId, content: $content) {
            id
            senderId
            receiverId
            content
            read
            createdAt
            updatedAt
          }
        }
      `,
            variables: { senderId, receiverId, content }
        }).pipe(map(result => result.data!.sendMessage));
    }
} 