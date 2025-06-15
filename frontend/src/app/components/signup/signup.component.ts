import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Inscription</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Nom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    formControlName="name"
                    [ngClass]="{'is-invalid': submitted && f['name'].errors}"
                  >
                  <div *ngIf="submitted && f['name'].errors" class="invalid-feedback">
                    <div *ngIf="f['name'].errors['required']">Le nom est requis</div>
                  </div>
                </div>

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
                    <div *ngIf="f['password'].errors['minlength']">Le mot de passe doit contenir au moins 6 caractères</div>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                    S'inscrire
                  </button>
                </div>

                <div *ngIf="error" class="alert alert-danger mt-3">
                  {{ error }}
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
export class SignupComponent {
    signupForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.signupForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    get f() { return this.signupForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.error = '';

        if (this.signupForm.invalid) {
            return;
        }

        this.loading = true;
        const { name, email, password } = this.signupForm.value;

        this.authService.signup(name, email, password).subscribe({
            next: () => {
                this.router.navigate(['/ads']);
            },
            error: (error) => {
                this.error = error.error.message || 'Une erreur est survenue lors de l\'inscription';
                this.loading = false;
            }
        });
    }
} 