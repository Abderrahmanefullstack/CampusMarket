import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, Message, Conversation } from '../../services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { forkJoin } from 'rxjs';
import { UserService, User } from '../../services/user.service';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
        <div class="container-fluid mt-4">
            <div class="row">
                <!-- Sidebar avec statistiques -->
                <div class="col-md-3">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">Statistiques</h5>
                        </div>
                        <div class="card-body">
                            <div class="stats-item">
                                <span class="badge bg-primary">{{ stats?.total || 0 }}</span>
                                <span>Conversations totales</span>
                            </div>
                            <div class="stats-item">
                                <span class="badge bg-warning">{{ stats?.unread || 0 }}</span>
                                <span>Non lues</span>
                            </div>
                            <div class="stats-item">
                                <span class="badge bg-secondary">{{ stats?.archived || 0 }}</span>
                                <span>Archivées</span>
                            </div>
                        </div>
                    </div>

                    <!-- Filtres et recherche -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Filtres</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" 
                                       class="form-control" 
                                       [(ngModel)]="searchQuery"
                                       (keyup.enter)="searchMessages()"
                                       placeholder="Rechercher...">
                            </div>
                            <div class="mb-3">
                                <select class="form-select" [(ngModel)]="statusFilter" (change)="filterConversations()">
                                    <option value="all">Tous les statuts</option>
                                    <option value="active">Actives</option>
                                    <option value="archived">Archivées</option>
                                    <option value="blocked">Bloquées</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Liste des conversations -->
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Conversations</h5>
                            <button class="btn btn-sm btn-outline-primary" (click)="showNewMessageModal()">
                                Nouveau message
                            </button>
                        </div>
                        <div class="list-group list-group-flush">
                            <!-- Pour le vendeur : vue d'ensemble de tous les chats par article -->
                            <div *ngIf="isSeller" class="list-group-item">
                                <div *ngFor="let postGroup of filteredConversations" class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h6 class="mb-1">{{ postGroup.post.title }}</h6>
                                        <div class="d-flex gap-2">
                                            <span class="badge bg-primary" *ngIf="postGroup.unreadCount > 0">
                                                {{ postGroup.unreadCount }}
                                            </span>
                                            <!-- Le statut est au niveau de chaque chat individuel, pas du groupe par article -->
                                        </div>
                                    </div>
                                    <div *ngFor="let chat of postGroup.chats" 
                                         class="chat-preview p-2"
                                         [class.active]="isActiveChat(chat)"
                                         (click)="selectChat(chat)">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="d-flex align-items-center">
                                                <img [src]="chat.buyer.avatar || 'assets/default-avatar.png'" 
                                                     class="avatar-sm me-2"
                                                     alt="Avatar">
                                                <small>{{ chat.buyer.name }}</small>
                                            </div>
                                            <small>{{ chat.lastMessage?.createdAt | date:'short' }}</small>
                                        </div>
                                        <p class="mb-0 text-truncate">{{ chat.lastMessage?.content }}</p>
                                        <div class="tags mt-1" *ngIf="chat.tags?.length">
                                            <span class="badge bg-light text-dark me-1" 
                                                  *ngFor="let tag of chat.tags">
                                                {{ tag }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pour l'acheteur : liste des articles contactés -->
                            <div *ngIf="!isSeller" class="list-group-item">
                                <div *ngFor="let conversation of filteredBuyerConversations" 
                                     class="chat-preview p-2"
                                     [class.active]="isActiveChat(conversation)"
                                     (click)="selectChat(conversation)">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <img [src]="conversation.post.images[0] || 'assets/default-image.png'" 
                                                 class="post-thumbnail me-2"
                                                 alt="Post thumbnail">
                                            <div>
                                                <h6 class="mb-1">{{ conversation.post.title }}</h6>
                                                <small class="text-muted">{{ conversation.post.price | currency }}</small>
                                            </div>
                                        </div>
                                        <small>{{ conversation.lastMessage?.createdAt | date:'short' }}</small>
                                    </div>
                                    <p class="mb-0 text-truncate">{{ conversation.lastMessage?.content }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Zone de chat -->
                <div class="col-md-6">
                    <div class="card" *ngIf="selectedChat">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <img [src]="selectedChat?.post?.images[0] || 'assets/default-image.png'" 
                                         class="post-thumbnail me-2"
                                         alt="Post thumbnail">
                                    <div>
                                        <h5 class="mb-0">{{ selectedChat?.post?.title }}</h5>
                                        <small class="text-muted">{{ selectedChat?.post?.price | currency }}</small>
                                    </div>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-secondary" 
                                            (click)="goToPost(selectedChat?.post?._id)">
                                        Voir l'annonce
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" 
                                            (click)="archiveConversation()"
                                            *ngIf="selectedChat?.status === 'active'">
                                        Archiver
                                    </button>
                                    <button class="btn btn-sm btn-outline-warning" 
                                            (click)="blockUser()"
                                            *ngIf="selectedChat?.status === 'active'">
                                        Bloquer
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex align-items-center mt-2">
                                <img [src]="isSeller ? selectedChat?.buyer?.avatar : selectedChat?.seller?.avatar || 'assets/default-avatar.png'" 
                                     class="avatar-sm me-2"
                                     alt="Avatar">
                                <small class="text-muted">
                                    Conversation avec {{ isSeller ? selectedChat?.buyer?.name : selectedChat?.seller?.name }}
                                </small>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="messages-container" #messagesContainer>
                                <div *ngFor="let message of messages" 
                                     class="message"
                                     [ngClass]="{'message-sent': message?.sender?._id === currentUserId, 
                                               'message-received': message?.sender?._id !== currentUserId}">
                                    <div class="message-content">
                                        <div class="message-header">
                                            <small>{{ message?.sender?.name }}</small>
                                            <small>{{ message?.createdAt | date:'short' }}</small>
                                        </div>
                                        <p>{{ message?.content }}</p>
                                        
                                        <!-- Offre -->
                                        <div class="offer-box" *ngIf="message?.offer">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <strong>Offre: {{ message?.offer?.price | currency }}</strong>
                                                <div class="d-flex gap-2" *ngIf="message?.sender?._id !== currentUserId">
                                                    <button class="btn btn-sm btn-success" 
                                                            (click)="respondToOffer(message, true)">
                                                        Accepter
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" 
                                                            (click)="respondToOffer(message, false)">
                                                        Rejeter
                                                    </button>
                                                </div>
                                            </div>
                                            <p class="mb-0">{{ message?.offer?.message }}</p>
                                        </div>

                                        <!-- Pièces jointes -->
                                        <div class="attachments" *ngIf="message?.attachments?.length">
                                            <div *ngFor="let attachment of message?.attachments" 
                                                 class="attachment-item">
                                                <img *ngIf="attachment?.type === 'image'" 
                                                     [src]="attachment?.url" 
                                                     class="img-thumbnail"
                                                     alt="Image">
                                                <a *ngIf="attachment?.type === 'file'" 
                                                   [href]="attachment?.url" 
                                                   target="_blank">
                                                    {{ attachment?.name }}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <form (ngSubmit)="sendMessage()" #messageForm="ngForm">
                                <div class="input-group">
                                    <input type="text" 
                                           class="form-control" 
                                           [(ngModel)]="newMessage" 
                                           name="message"
                                           placeholder="Écrivez votre message..."
                                           required>
                                    <button class="btn btn-outline-secondary" 
                                            type="button"
                                            (click)="fileInput.click()">
                                        <i class="bi bi-paperclip"></i>
                                    </button>
                                    <input #fileInput 
                                           type="file" 
                                           multiple 
                                           (change)="onFileSelect($event)"
                                           style="display: none">
                                    <button class="btn btn-primary" 
                                            type="submit"
                                            [disabled]="(!newMessage.trim() && selectedFiles.length === 0) || !selectedChat">
                                        Envoyer
                                    </button>
                                </div>
                                <div class="selected-files mt-2" *ngIf="selectedFiles.length">
                                    <div *ngFor="let file of selectedFiles" class="d-flex align-items-center">
                                        <small>{{ file?.name }}</small>
                                        <button class="btn btn-sm btn-link text-danger" 
                                                (click)="removeFile(file)">
                                            <i class="bi bi-x"></i>
                                </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="card" *ngIf="!selectedChat">
                        <div class="card-body text-center">
                            <p class="mb-0">Sélectionnez une conversation pour commencer à discuter</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .messages-container {
            height: 500px;
            overflow-y: auto;
            padding: 1rem;
        }
        .message {
            margin-bottom: 1rem;
            max-width: 70%;
        }
        .message-sent {
            margin-left: auto;
        }
        .message-received {
            margin-right: auto;
        }
        .message-content {
            padding: 0.5rem 1rem;
            border-radius: 1rem;
        }
        .message-sent .message-content {
            background-color: #007bff;
            color: white;
        }
        .message-received .message-content {
            background-color: #f8f9fa;
        }
        .chat-preview {
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .chat-preview:hover {
            background-color: #f8f9fa;
        }
        .chat-preview.active {
            background-color: #e9ecef;
        }
        .avatar-sm {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
        }
        .post-thumbnail {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 4px;
        }
        .stats-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .offer-box {
            background-color: #f8f9fa;
            border-radius: 0.5rem;
            padding: 0.5rem;
            margin-top: 0.5rem;
        }
        .attachments {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .attachment-item img {
            max-width: 200px;
            max-height: 200px;
        }
        .selected-files {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
    `]
})
export class MessagesComponent implements OnInit {
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    conversationsByPost: any[] = []; // Utiliser any[] car ce n'est pas une Conversation[] simple
    buyerConversations: Conversation[] = [];
    messages: Message[] = [];
    selectedChat: any = null;
    currentUserId: string = localStorage.getItem('userId') || '';
    newMessage: string = '';
    isSeller: boolean = false;
    searchQuery: string = '';
    statusFilter: string = 'all';
    selectedFiles: File[] = [];
    stats: any = null;

    constructor(
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
        private postService: PostService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.loadConversations();
        this.loadStats();
        this.route.params.subscribe(params => {
            if (params['postId'] && params['receiverId']) {
                // Note: L'initialisation directe du chat via les paramètres d'URL
                // pourrait nécessiter de trouver la conversation correspondante
                // dans la liste chargée ou de faire un appel spécifique si elle n'est pas là.
                // Pour l'instant, on suppose qu'elle est dans la liste chargée ou que l'appel getConversation est suffisant.
                this.initiateChat(params['postId'], params['receiverId']);
            }
        });
    }

    loadStats() {
        this.messageService.getConversationStats().subscribe(
            stats => this.stats = stats,
            error => console.error('Erreur lors du chargement des statistiques:', error)
        );
    }

    loadConversations() {
        this.messageService.getConversations().subscribe(
            (data) => {
                // Grouper les conversations par post pour le vendeur
                const conversationsByPostMap = new Map<string, any>();
                data.forEach(conversation => {
                    if (!conversationsByPostMap.has(conversation.post._id)) {
                        conversationsByPostMap.set(conversation.post._id, {
                            post: conversation.post,
                            chats: [], // <-- 'chats' property is added here
                            unreadCount: 0
                        });
                    }
                    const postGroup = conversationsByPostMap.get(conversation.post._id);
                    postGroup.chats.push(conversation);
                    // Utiliser lastMessage pour vérifier read et receiver
                    if (conversation.lastMessage && !conversation.lastMessage.read && conversation.lastMessage.receiver._id === this.currentUserId) {
                        postGroup.unreadCount++;
                    }
                });
                this.conversationsByPost = Array.from(conversationsByPostMap.values());

                // Pour l'acheteur, garder une liste plate des conversations où ils sont impliqués
                this.buyerConversations = data.filter(c => c.buyer?._id === this.currentUserId || c.seller?._id === this.currentUserId);

                // Déterminer si l'utilisateur est un vendeur
                // Un utilisateur est considéré vendeur s'il a au moins une conversation où il est le vendeur
                this.isSeller = data.some(c => c.seller?._id === this.currentUserId);

            },
            (error) => {
                console.error('Erreur lors du chargement des conversations:', error);
            }
        );
    }

    get filteredConversations() {
        // Filtrer par statut au niveau du groupe d'articles (si tous les chats du groupe ont le même statut?)
        // Ou filtrer les chats individuels dans le groupe?
        // Pour l'instant, on filtre les groupes s'ils contiennent au moins un chat avec le statut sélectionné
        if (this.statusFilter === 'all') {
            return this.conversationsByPost;
        }
        return this.conversationsByPost
            .map(postGroup => ({
                ...postGroup,
                chats: postGroup.chats.filter((chat: Conversation) => chat.status === this.statusFilter)
            }))
            .filter(postGroup => postGroup.chats.length > 0);
    }

    get filteredBuyerConversations() {
        return this.buyerConversations.filter(conv =>
            this.statusFilter === 'all' || conv.status === this.statusFilter
        );
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success';
            case 'archived': return 'bg-secondary';
            case 'blocked': return 'bg-danger';
            default: return 'bg-primary';
        }
    }

    searchMessages() {
        if (this.searchQuery.trim()) {
            // Ceci recherche dans tous les messages, pas seulement la conversation sélectionnée.
            // Une amélioration serait de rechercher dans la conversation actuelle si une est sélectionnée.
            this.messageService.searchMessages(this.searchQuery).subscribe(
                messages => {
                    this.messages = messages;
                },
                error => console.error('Erreur lors de la recherche:', error)
            );
        } else if (this.selectedChat) {
            // Si la recherche est vide et un chat est sélectionné, recharger les messages de ce chat
            this.loadMessages(this.selectedChat.post._id, this.selectedChat.buyer._id);
        } else {
            // Si la recherche est vide et aucun chat n'est sélectionné, peut-être charger les conversations principales?
            this.loadConversations();
        }
    }

    filterConversations() {
        // Le filtrage est géré par les getters filteredConversations et filteredBuyerConversations
        // et déclenché par le changement de statusFilter
    }

    onFileSelect(event: any) {
        const files = event.target.files;
        if (files) {
            this.selectedFiles.push(...Array.from(files) as File[]);
        }
    }

    removeFile(file: File) {
        this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    }

    sendMessage() {
        if (!this.newMessage.trim() && this.selectedFiles.length === 0 || !this.selectedChat) return;

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('sendMessage - selectedChat:', this.selectedChat);
        // *****************************

        // Vérifier que les IDs nécessaires existent avant d'envoyer le message
        const receiverId =
            typeof this.selectedChat.buyer._id === 'string'
                ? this.selectedChat.buyer._id
                : (this.selectedChat.buyer._id._id || this.selectedChat.buyer._id.$oid);
        const postId = this.selectedChat.post?._id;

        if (!receiverId || !postId) {
            console.error('Impossible d\'envoyer le message: Informations de chat incomplètes', this.selectedChat);
            return;
        }

        this.messageService.sendMessage(
            receiverId,
            postId,
            this.newMessage,
            this.selectedFiles
        ).subscribe(
            (response) => {
                // Ajouter le nouveau message à la liste actuelle
                this.messages.push(response);
                this.newMessage = '';
                this.selectedFiles = [];
                // Optionnel: Rafraîchir les conversations ou juste la conversation actuelle pour l'aperçu
                this.loadConversations(); // Pour mettre à jour le lastMessage et unreadCount dans la liste
                this.scrollToBottom();
            },
            (error) => {
                console.error('Erreur lors de l\'envoi du message:', error);
            }
        );
    }

    showNewMessageModal() {
        console.log('Afficher la modale ou naviguer pour Nouveau message');
        // Ici, vous implémenteriez la logique pour permettre à l'utilisateur de démarrer un nouveau chat
        // Cela pourrait impliquer de sélectionner un article et un destinataire.
        // Exemple de navigation (si vous avez une route dédiée):
        // this.router.navigate(['/messages/new']);

        // Ou ouvrir une modale:
        // this.modalService.open(NewMessageModalComponent);
        // Naviguer vers une page dédiée pour créer un nouveau message
        this.router.navigate(['/messages/new']);
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            }
        });
    }

    initiateChat(postId: string, receiverId: string) {
        // Tenter de trouver la conversation existante d'abord
        const existingConversation = this.buyerConversations.find(c => c.post._id === postId && ((c.buyer?._id === this.currentUserId && c.seller?._id === receiverId) || (c.seller?._id === this.currentUserId && c.buyer?._id === receiverId)));

        if (existingConversation) {
            this.selectChat(existingConversation);
        } else {
            // Si pas de conversation existante, charger les informations nécessaires et initialiser selectedChat
            forkJoin([
                this.postService.getPost(postId), // Récupérer les infos de l'article
                this.userService.getUser(receiverId) // Récupérer les infos de l'utilisateur destinataire
            ]).subscribe(
                ([post, receiverUser]) => {
                    // Créer un objet selectedChat avec les informations de l'article et de l'autre utilisateur
                    this.selectedChat = {
                        post: post,
                        // Déterminer qui est l'acheteur et le vendeur dans ce nouveau chat
                        buyer: this.currentUserId === post.userId._id ? receiverUser : { _id: post.userId._id, name: post.userId.name },
                        seller: this.currentUserId === post.userId._id ? { _id: this.currentUserId, name: 'You' } : post.userId,
                        lastMessage: null,
                        unreadCount: 0,
                        status: 'active',
                        lastActivity: new Date(),
                        tags: [],
                        chats: [] // Vide pour une nouvelle conversation
                    };
                    this.messages = []; // Pas de messages pour un nouveau chat
                    this.scrollToBottom(); // Faire défiler même s'il n'y a pas de messages
                    console.log('Nouveau chat initialisé avec:', this.selectedChat);
                },
                (error) => {
                    console.error('Erreur lors de l\'initialisation du nouveau chat:', error);
                    // Gérer l\'erreur (afficher un message à l\'utilisateur)
                }
            );
        }
    }

    selectChat(chat: Conversation) {
        this.selectedChat = chat; // chat est de type Conversation ici
        // Charger les messages pour cette conversation sélectionnée
        // Les conversations dans la liste (buyerConversations et chats dans conversationsByPost) ne contiennent pas tous les messages, seulement le lastMessage
        // Il faut donc un appel séparé pour charger tous les messages de la conversation sélectionnée.
        // Assurez-vous que l\'ID passé est bien celui de l\'autre partie.
        const otherUserId = chat.buyer?._id === this.currentUserId ? chat.seller?._id : chat.buyer?._id; // Utiliser ?. ici
        if (otherUserId && chat.post?._id) { // Vérifier si les IDs sont valides
            this.loadMessages(chat.post._id, otherUserId);
        } else {
            console.error('Impossible de charger les messages: IDs de chat invalides', chat);
        }

        // Marquer la conversation sélectionnée comme lue côté frontend immédiatement pour l\'aperçu
        if (this.selectedChat && this.selectedChat.unreadCount > 0) { // Vérifier selectedChat
            this.selectedChat.unreadCount = 0; // Mettre à jour l\'aperçu
            // L\'appel markAsRead dans loadMessages s\'occupera de la mise à jour côté backend
        }
    }

    loadMessages(postId: string, userId: string) {
        this.messageService.getConversation(postId, userId).subscribe(
            (data) => {
                this.messages = data;
                this.scrollToBottom();
                // Marquer les messages comme lus après le chargement
                // Idéalement, marquer comme lu quand l\'utilisateur voit les messages (par ex. après un certain temps ou un scroll)
                // Pour simplifier, on marque tout comme lu ici pour l\'utilisateur actuel.\n                 // Filtrer uniquement les messages reçus par l\'utilisateur actuel qui ne sont pas encore lus
                data.filter(m => !m.read && m.receiver._id === this.currentUserId).forEach(m => {
                    this.messageService.markAsRead(m._id).subscribe(); // Envoyer les requêtes sans attendre la réponse
                });
                // Rafraîchir la liste des conversations pour mettre à jour les counts non lus
                this.loadConversations();
            },
            (error) => {
                console.error('Erreur lors du chargement des messages:', error);
            }
        );
    }

    isActiveChat(chatItem: any): boolean {
        // chatItem peut être un groupe de conversations (pour le vendeur) ou une conversation directe (pour l\'acheteur)

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('isActiveChat appelée avec chatItem:', chatItem);
        console.log('selectedChat actuel:', this.selectedChat);
        // *****************************

        if (!this.selectedChat) {
            return false;
        }

        if (this.isSeller && chatItem.chats) {
            // Vue vendeur: chatItem est un groupe par post. Comparer avec le post et le buyer du chat sélectionné.
            return chatItem.chats.some((c: Conversation) =>
                this.selectedChat.post?._id === c.post?._id && // Utiliser ?. ici aussi
                this.selectedChat.buyer?._id === c.buyer?._id // Utiliser ?. ici aussi
            );
        } else if (!this.isSeller && chatItem.post) {
            // Vue acheteur: chatItem est une conversation directe. Comparer avec le post et le buyer du chat sélectionné.
            return this.selectedChat.post?._id === chatItem.post?._id && // Utiliser ?. ici aussi
                this.selectedChat.buyer?._id === chatItem.buyer?._id; // Utiliser ?. ici aussi
        }

        return false;
    }

    goToPost(postId: string) {
        this.router.navigate(['/ads']);
    }

    makeOffer(price: number, message: string) {
        if (!this.selectedChat || price <= 0) return;

        this.messageService.makeOffer(
            this.selectedChat.post._id,
            this.selectedChat.seller._id, // L\'ID du vendeur de l\'article
            price,
            message
        ).subscribe(
            (response) => {
                // Ajouter le message d\'offre à la liste actuelle
                this.messages.push(response);
                this.scrollToBottom();
                this.loadConversations(); // Pour mettre à jour l\'aperçu de la conversation si l\'offre est le dernier message
            },
            error => console.error('Erreur lors de l\'envoi de l\'offre:', error)
        );
    }

    respondToOffer(message: Message, accept: boolean) {
        if (!message.offer || message.sender._id === this.currentUserId) return; // Ne peut pas répondre à sa propre offre

        this.messageService.respondToOffer(message._id, accept).subscribe(
            (response) => {
                // Mettre à jour le message d\'offre dans la liste des messages
                const index = this.messages.findIndex(m => m._id === response._id);
                if (index !== -1) {
                    this.messages[index] = response;
                }
                // Optionnel: afficher une notification à l\'autre utilisateur
                this.loadConversations(); // Pour mettre à jour l\'aperçu de la conversation si le statut de l\'offre change
            },
            error => console.error('Erreur lors de la réponse à l\'offre:', error)
        );
    }

    archiveConversation() {
        if (!this.selectedChat) return;

        // Déterminer l\'ID de l\'autre partie dans la conversation
        const otherUserId = this.isSeller ? this.selectedChat.buyer._id : this.selectedChat.seller._id;

        this.messageService.archiveConversation(
            this.selectedChat.post._id,
            otherUserId
        ).subscribe(
            () => {
                console.log('Conversation archivée');
                this.loadConversations();
                this.selectedChat = null; // Désélectionner la conversation archivée
            },
            error => console.error('Erreur lors de l\'archivage:', error)
        );
    }

    blockUser() {
        if (!this.selectedChat) return;

        // Déterminer l\'ID de l\'utilisateur à bloquer (l\'autre partie)
        const userToBlockId = this.isSeller ? this.selectedChat.buyer._id : this.selectedChat.seller._id;

        this.messageService.blockUser(
            userToBlockId
        ).subscribe(
            () => {
                console.log('Utilisateur bloqué');
                this.loadConversations();
                this.selectedChat = null; // Désélectionner la conversation associée à l\'utilisateur bloqué
                // Optionnel: afficher un message de confirmation à l\'utilisateur
            },
            error => console.error('Erreur lors du blocage:', error)
        );
    }

    addTags(tags: string[]) {
        if (!this.selectedChat || tags.length === 0) return;

        // Déterminer l\'ID de l\'autre partie dans la conversation
        const otherUserId = this.isSeller ? this.selectedChat.buyer._id : this.selectedChat.seller._id;

        this.messageService.addTags(
            this.selectedChat.post._id,
            otherUserId,
            tags
        ).subscribe(
            (updatedConversation) => {
                console.log('Tags ajoutés', updatedConversation);
                // Mettre à jour la conversation dans la liste pour refléter les nouveaux tags
                this.loadConversations();
            },
            error => console.error('Erreur lors de l\'ajout des tags:', error)
        );
    }
} 