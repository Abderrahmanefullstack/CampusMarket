import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
    isLoggedIn$ = this.loggedIn.asObservable();

    constructor(private apollo: Apollo) { }

    login(email: string, password: string): Observable<string> {
        return this.apollo.mutate<any>({
            mutation: gql`
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password)
        }
      `,
            variables: { email, password }
        }).pipe(
            map(result => result.data.login),
            tap(token => {
                localStorage.setItem('token', token);
                this.loggedIn.next(true);
            })
        );
    }

    signup(email: string, password: string, name: string): Observable<string> {
        return this.apollo.mutate<any>({
            mutation: gql`
        mutation Signup($email: String!, $password: String!, $name: String!) {
          signup(email: $email, password: $password, name: $name)
        }
      `,
            variables: { email, password, name }
        }).pipe(
            map(result => result.data.signup),
            tap(token => {
                localStorage.setItem('token', token);
                this.loggedIn.next(true);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.loggedIn.next(false);
    }
} 