import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
    loginForm: FormGroup;
    signupForm: FormGroup;
    isLoginMode = true;
    loading = false;
    error: string | null = null;

    constructor(private fb: FormBuilder, private auth: AuthService) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        this.signupForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            name: ['', Validators.required]
        });
    }

    switchMode() {
        this.isLoginMode = !this.isLoginMode;
        this.error = null;
    }

    onLogin() {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.auth.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
            next: () => { this.loading = false; },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }

    onSignup() {
        if (this.signupForm.invalid) return;
        this.loading = true;
        this.auth.signup(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.name).subscribe({
            next: () => { this.loading = false; },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }
} 