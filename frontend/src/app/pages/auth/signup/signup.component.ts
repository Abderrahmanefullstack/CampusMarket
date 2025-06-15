import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Inscription</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="name" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput formControlName="password" type="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="!signupForm.valid">
              S'inscrire
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer>
          <p>Déjà inscrit ? <a routerLink="/signin">Se connecter</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
    styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    mat-card {
      max-width: 400px;
      width: 100%;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    button {
      margin-top: 20px;
    }
    mat-card-footer {
      text-align: center;
      margin-top: 20px;
    }
  `]
})
export class SignupComponent {
    signupForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router
    ) {
        this.signupForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit() {
        if (this.signupForm.valid) {
            // TODO: Implémenter l'appel à l'API d'inscription
            console.log(this.signupForm.value);
        }
    }
} 