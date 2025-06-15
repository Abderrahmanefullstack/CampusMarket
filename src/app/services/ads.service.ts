import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  sellerId: string;
  sold: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdsService {
  constructor(private apollo: Apollo) { }

  getAds(): Observable<Ad[]> {
    return this.apollo.watchQuery<{ ads: Ad[] }>({
      query: gql`
        query {
          ads {
            id
            title
            description
            price
            sellerId
            sold
            createdAt
            updatedAt
          }
        }
      `
    }).valueChanges.pipe(map(result => result.data.ads));
  }

  createAd(title: string, description: string, price: number, sellerId: string): Observable<Ad> {
    return this.apollo.mutate<{ createAd: Ad }>({
      mutation: gql`
        mutation CreateAd($title: String!, $description: String!, $price: Float!, $sellerId: String!) {
          createAd(title: $title, description: $description, price: $price, sellerId: $sellerId) {
            id
            title
            description
            price
            sellerId
            sold
            createdAt
            updatedAt
          }
        }
      `,
      variables: { title, description, price, sellerId }
    }).pipe(map(result => result.data!.createAd));
  }
} 