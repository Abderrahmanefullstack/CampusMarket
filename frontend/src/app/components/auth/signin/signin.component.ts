import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface ErrorResponse {
    error: {
        message: string;
    };
}

@Component({
    selector: 'app-signin',
    standalone: false,
    template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Connexion</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="signinForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                  >
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">L'email est requis</div>
                    <div *ngIf="f['email'].errors['email']">L'email n'est pas valide</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    formControlName="password"
                    [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                  >
                  <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                    <div *ngIf="f['password'].errors['required']">Le mot de passe est requis</div>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Se connecter
                  </button>
                </div>

                <div *ngIf="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>

                <div class="text-center mt-3">
                  <p>Pas encore de compte ? <a routerLink="/signup">S'inscrire</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  `]
})
export class SigninComponent {
    signinForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.signinForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    get f() { return this.signinForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.error = '';

        if (this.signinForm.invalid) {
            return;
        }

        this.loading = true;
        const { email, password } = this.signinForm.value;

        this.authService.signin(email, password).subscribe({
            next: () => {
                this.router.navigate(['/ads']);
            },
            error: (error: ErrorResponse) => {
                this.error = error.error.message || 'Une erreur est survenue lors de la connexion';
                this.loading = false;
            }
        });
    }
} 