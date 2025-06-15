import { Component, OnInit } from '@angular/core';
import { PostService, Post } from '../../../services/post.service';
import { UserService, User } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent implements OnInit {
  articleSearchQuery = '';
  articles: Post[] = [];
  selectedArticle: Post | null = null;
  newMessageContent = '';

  private articleSearchTerms = new Subject<string>();

  constructor(
    private postService: PostService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.articleSearchTerms.pipe(
      debounceTime(300), // attendre 300ms après chaque frappe
      distinctUntilChanged(), // ignorer si le terme de recherche précédent est le même
      switchMap((term: string) => this.postService.getAllPosts() // Remplacez par searchPosts si disponible
      ) // changer vers un nouveau observable de recherche d'articles
    ).subscribe(articles => this.articles = articles);
  }

  searchArticles(): void {
    this.articleSearchTerms.next(this.articleSearchQuery);
  }

  selectArticle(article: Post): void {
    this.selectedArticle = article;
    this.articles = []; // Cacher les résultats de recherche après sélection
  }

  clearArticle(): void {
    this.selectedArticle = null;
    this.articles = [];
    this.articleSearchQuery = '';
  }

  sendMessage(): void {
    if (!this.selectedArticle || !this.newMessageContent.trim()) {
      return; // Ne pas envoyer si article ou message sont manquants
    }

    // Le destinataire est le propriétaire de l'article
    const receiverId = this.selectedArticle.userId._id;

    this.messageService.sendMessage(
      receiverId,
      this.selectedArticle._id,
      this.newMessageContent
    ).subscribe(
      (response) => {
        console.log('Message envoyé:', response);
        // Rediriger vers la conversation après l'envoi du message
        this.router.navigate(['/messages', this.selectedArticle?._id, receiverId]); // Naviguer vers la conversation spécifique
      },
      (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        // Gérer l'erreur (afficher un message à l'utilisateur)
      }
    );
  }
}
