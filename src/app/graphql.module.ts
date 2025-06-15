import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpHeaders } from '@angular/common/http';

const uri = 'http://localhost:3000/graphql'; // URL de l'API Gateway GraphQL

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
    const http = httpLink.create({ uri });
    // Middleware pour ajouter le JWT si besoin
    const auth = setContext((operation, context) => {
        const token = localStorage.getItem('token');
        if (token) {
            return {
                headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
            };
        } else {
            return {};
        }
    });
    return {
        link: ApolloLink.from([auth, http]),
        cache: new InMemoryCache(),
    };
}

@NgModule({
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: createApollo,
            deps: [HttpLink],
        },
    ],
})
export class GraphQLModule { } 