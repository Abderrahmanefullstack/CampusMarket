import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-ads',
    standalone: false,
    template: `
    <div class="container mt-4 mb-5">
      <div class="row mb-4 align-items-center">
        <div class="col">
          <h2>Annonces disponibles</h2>
        </div>
        <div class="col text-end">
          <button class="btn btn-primary" (click)="toggleCreateForm()">
            {{ showCreateForm ? 'Annuler la création' : 'Créer une annonce' }}
          </button>
          <!-- Bouton de déconnexion -->
          <button class="btn btn-danger ms-2" (click)="logout()">
            Se déconnecter
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
            <div class="row">
              <div class="col-md-3 mb-3">
                <label for="categoryFilter" class="form-label">Catégorie</label>
                <select class="form-select" id="categoryFilter" formControlName="category">
                  <option value="">Toutes les catégories</option>
                  <option value="books">Livres</option>
                  <option value="supplies">Fournitures</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <label for="conditionFilter" class="form-label">État</label>
                <select class="form-select" id="conditionFilter" formControlName="condition">
                  <option value="">Tous les états</option>
                  <option value="new">Neuf</option>
                  <option value="like-new">Comme neuf</option>
                  <option value="used">Usagé</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <label for="minPrice" class="form-label">Prix minimum</label>
                <input type="number" class="form-control" id="minPrice" formControlName="minPrice">
              </div>
              <div class="col-md-3 mb-3">
                <label for="maxPrice" class="form-label">Prix maximum</label>
                <input type="number" class="form-control" id="maxPrice" formControlName="maxPrice">
              </div>
            </div>
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" (click)="resetFilters()">Réinitialiser</button>
              <button type="submit" class="btn btn-primary">Filtrer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Formulaire de création/édition -->
      <div class="card mb-4" *ngIf="showCreateForm || showEditForm">
        <div class="card-header bg-primary text-white">
          <h3 class="mb-0">{{ showCreateForm ? 'Créer une nouvelle annonce' : 'Modifier l\\\'annonce' }}</h3>
        </div>
        <div class="card-body">
          <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="title" class="form-label">Titre</label>
                <input type="text" class="form-control" id="title" formControlName="title"
                       placeholder="Ex: Livre de Mathématiques">
                <div class="text-danger" *ngIf="postForm.get('title')?.errors?.['required'] && postForm.get('title')?.touched">
                  Le titre est requis
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label for="price" class="form-label">Prix (€)</label>
                <input type="number" class="form-control" id="price" formControlName="price"
                       placeholder="Ex: 25">
                <div class="text-danger" *ngIf="postForm.get('price')?.errors?.['required'] && postForm.get('price')?.touched">
                  Le prix est requis
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-control" id="description" rows="3" formControlName="description"
                        placeholder="Décrivez votre article en détail..."></textarea>
              <div class="text-danger" *ngIf="postForm.get('description')?.errors?.['required'] && postForm.get('description')?.touched">
                La description est requise
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="category" class="form-label">Catégorie</label>
                <select class="form-select" id="category" formControlName="category">
                  <option value="books">Livres</option>
                  <option value="supplies">Fournitures</option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <label for="condition" class="form-label">État</label>
                <select class="form-select" id="condition" formControlName="condition">
                  <option value="new">Neuf</option>
                  <option value="like-new">Comme neuf</option>
                  <option value="used">Usagé</option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <label for="location" class="form-label">Lieu</label>
                <input type="text" class="form-control" id="location" formControlName="location"
                       placeholder="Ex: Paris">
                <div class="text-danger" *ngIf="postForm.get('location')?.errors?.['required'] && postForm.get('location')?.touched">
                  Le lieu est requis
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="images" class="form-label">Images</label>
              <input type="file" class="form-control" id="images" multiple (change)="onFileSelect($event)"
                     accept="image/*">
              <div class="form-text">Vous pouvez sélectionner plusieurs images</div>
              <!-- Afficher les images existantes en mode édition -->
              <div *ngIf="showEditForm && postForm.get('images')?.value?.length > 0" class="mt-2">
                  <p>Images actuelles:</p>
                  <div class="d-flex flex-wrap">
                      <img *ngFor="let imageUrl of postForm.get('images')?.value" [src]="imageUrl" alt="Existing Image" class="img-thumbnail me-2 mb-2" style="width: 100px; height: 100px; object-fit: cover;">
                  </div>
              </div>
            </div>

            <div class="alert alert-danger" *ngIf="formError">
                Veuillez remplir tous les champs requis correctement.
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="postForm.invalid || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                <ng-container *ngIf="!isSubmitting">{{ showCreateForm ? 'Créer l\\\'annonce' : 'Modifier l\\\'annonce' }}</ng-container>
                <ng-container *ngIf="isSubmitting">{{ showCreateForm ? 'Création en cours...' : 'Modification en cours...' }}</ng-container>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Liste des annonces -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" *ngFor="let post of filteredPosts">
          <div class="card h-100 shadow">
            <div class="position-relative">
              <img [src]="post.images[0]" class="card-img-top" alt="{{ post.title }}">
              <span class="position-absolute top-0 end-0 badge bg-primary m-2">
                {{ post.price }}€
              </span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ post.title }}</h5>
              <p class="card-text flex-grow-1">{{ post.description }}</p>
              <p class="card-text">
                <strong>Catégorie:</strong> {{ post.category === 'books' ? 'Livres' : 'Fournitures' }}<br>
                <strong>État:</strong> {{ post.condition === 'new' ? 'Neuf' : post.condition === 'like-new' ? 'Comme neuf' : 'Usagé' }}<br>
                <strong>Lieu:</strong> {{ post.location }}
              </p>
              <p class="card-text">
                <small class="text-muted">Publié par {{ post.userId.name }}</small>
              </p>
            </div>
            <div class="card-footer d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" *ngIf="!isOwner(post)" (click)="contactSeller(post)">
                Contacter
              </button>
              <button class="btn btn-sm btn-outline-secondary" *ngIf="isOwner(post)" (click)="onEditClick(post)">
                Modifier
              </button>
              <button class="btn btn-sm btn-outline-danger" *ngIf="isOwner(post)" (click)="deletePost(post._id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .card-img-top {
      height: 200px;
      object-fit: cover;
    }
    /* Ajouter un style pour les cartes avec ombre */
    .card.shadow, .card.shadow-sm {
        box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
    }
    .card.shadow-sm:hover {
        transform: translateY(-5px) scale(1.005);
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
    }
  `]
})
export class AdsComponent implements OnInit {
    posts: Post[] = [];
    filteredPosts: Post[] = [];
    postForm: FormGroup;
    filterForm: FormGroup;
    showCreateForm = false;
    showEditForm = false;
    editingPostId: string | null = null;
    isSubmitting = false;
    selectedFiles: File[] = [];
    formError = false;

    constructor(
        private fb: FormBuilder,
        private postService: PostService,
        private authService: AuthService,
        private router: Router
    ) {
        this.postForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            price: ['', [Validators.required, Validators.min(0)]],
            category: ['books', Validators.required],
            condition: ['new', Validators.required],
            location: ['', Validators.required],
            images: [[]]
        });

        this.filterForm = this.fb.group({
            category: [''],
            condition: [''],
            minPrice: [''],
            maxPrice: ['']
        });
    }

    ngOnInit(): void {
        this.loadPosts();
    }

    loadPosts(): void {
        this.postService.getAllPosts().subscribe({
            next: (posts: Post[]) => {
                this.posts = posts;
                this.filteredPosts = posts;
            },
            error: (error: any) => {
                console.error('Erreur lors du chargement des posts:', error);
            }
        });
    }

    applyFilters(): void {
        const filters = this.filterForm.value;
        this.filteredPosts = this.posts.filter(post => {
            const categoryMatch = !filters.category || post.category === filters.category;
            const conditionMatch = !filters.condition || post.condition === filters.condition;
            const priceMatch = (!filters.minPrice || post.price >= filters.minPrice) &&
                (!filters.maxPrice || post.price <= filters.maxPrice);
            return categoryMatch && conditionMatch && priceMatch;
        });
    }

    resetFilters(): void {
        this.filterForm.reset({
            category: '',
            condition: '',
            minPrice: '',
            maxPrice: ''
        });
        this.filteredPosts = this.posts;
    }

    onFileSelect(event: Event): void {
        const element = event.target as HTMLInputElement;
        let files: FileList | null = element.files;
        if (files) {
            this.selectedFiles = Array.from(files);
        }
    }

    onSubmit(): void {
        console.log('État du formulaire avant soumission:', this.postForm);
        this.formError = false;

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Valeur du contrôle images avant FormData:', this.postForm.get('images')?.value);
        // *****************************

        if (this.postForm.invalid) {
            this.formError = true;
            this.markFormGroupTouched(this.postForm);
            console.log('Formulaire invalide. Affichage des erreurs.');
            return;
        }

        this.isSubmitting = true;

        const formData = new FormData();
        formData.append('title', this.postForm.get('title')?.value);
        formData.append('description', this.postForm.get('description')?.value);
        formData.append('price', this.postForm.get('price')?.value);
        formData.append('category', this.postForm.get('category')?.value);
        formData.append('condition', this.postForm.get('condition')?.value);
        formData.append('location', this.postForm.get('location')?.value);

        for (let i = 0; i < this.selectedFiles.length; i++) {
            formData.append('images', this.selectedFiles[i], this.selectedFiles[i].name);
        }

        if (this.showEditForm) {
            const existingImages = this.postForm.get('images')?.value || [];
            existingImages.forEach((imageUrl: string) => {
                formData.append('existingImages[]', imageUrl);
            });
        }

        let operation: Observable<Post>;

        // *** LOGS DE DEBUG TEMPORAIRES ***
        console.log('État des drapeaux dans onSubmit:');
        console.log('showCreateForm:', this.showCreateForm);
        console.log('showEditForm:', this.showEditForm);
        console.log('editingPostId:', this.editingPostId);
        // *********************************

        if (this.showCreateForm) {
            operation = this.postService.createPost(formData);
        } else if (this.showEditForm && this.editingPostId) {
            console.log('Mise à jour du post - ID:', this.editingPostId, 'par l\'utilisateur ID:', this.authService.getCurrentUser()?.id);
            operation = this.postService.updatePost(this.editingPostId, formData);
        } else {
            this.isSubmitting = false;
            return;
        }

        operation.subscribe({
            next: (responsePost: Post) => {
                console.log('Opération réussie:', responsePost);
                this.isSubmitting = false;
                this.formError = false;
                this.postForm.reset();
                this.selectedFiles = [];
                this.showCreateForm = false;
                this.showEditForm = false;
                this.editingPostId = null;
                this.loadPosts();
            },
            error: (error: any) => {
                console.error('Erreur lors de l\'opération:', error);
                this.isSubmitting = false;
                this.formError = true;
            }
        });
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    toggleCreateForm(): void {
        if (this.showEditForm) {
            this.cancelForm();
        }
        this.showCreateForm = !this.showCreateForm;
        if (this.showCreateForm) {
            this.postForm.reset();
            this.selectedFiles = [];
            this.formError = false;
        }
    }

    onEditClick(post: Post): void {
        if (this.showCreateForm) {
            this.cancelForm();
        }
        this.editingPostId = post._id;
        this.showEditForm = true;
        this.formError = false;

        this.postForm.patchValue({
            title: post.title,
            description: post.description,
            price: post.price,
            category: post.category,
            condition: post.condition,
            location: post.location,
            images: post.images
        });
        this.selectedFiles = [];
    }

    cancelForm(): void {
        this.showCreateForm = false;
        this.showEditForm = false;
        this.editingPostId = null;
        this.postForm.reset();
        this.selectedFiles = [];
        this.formError = false;
    }

    isOwner(post: Post): boolean {
        const currentUser = this.authService.getCurrentUser();
        return currentUser !== null && post.userId && post.userId._id === currentUser.id;
    }

    contactSeller(post: Post): void {
        console.log('Contacter le vendeur:', post.userId);
        this.router.navigate(['/messages', { receiverId: post.userId._id, postId: post._id }]);
    }

    deletePost(id: string): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            this.postService.deletePost(id).subscribe({
                next: () => {
                    console.log('Post supprimé avec succès');
                    this.loadPosts();
                },
                error: (error: any) => {
                    console.error('Erreur lors de la suppression du post:', error);
                }
            });
        }
    }

    logout(): void {
        // Appeler la méthode de déconnexion du service d'authentification
        this.authService.logout();
        // Rediriger l'utilisateur vers la page de connexion
        this.router.navigate(['/signin']);
    }
} 